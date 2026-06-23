/**
 * api.js — Camada compartilhada de API, autenticação, sidebar e utilitários.
 */

const AUTH_KEY = 'biblioteca_auth';

function getAuth() {
  try { return JSON.parse(sessionStorage.getItem(AUTH_KEY)); }
  catch { return null; }
}

function checkAuth() {
  const auth = getAuth();
  if (!auth || !auth.email || !auth.senha) {
    window.location.href = '/index.html';
    return null;
  }
  return auth;
}

function checkBibliotecario() {
  const auth = checkAuth();
  if (!auth) return null;
  if (auth.perfil !== 'BIBLIOTECARIO') {
    toast('Acesso restrito a bibliotecários.', 'err');
    setTimeout(() => window.location.href = '/catalogo.html', 1500);
    return null;
  }
  return auth;
}

/**
 * NOVO — verifica se o usuário é BIBLIOTECARIO ou ASSISTENTE (staff da biblioteca).
 * Usado em telas como usuarios.html (listagem de usuários).
 */
function checkStaff() {
  const auth = checkAuth();
  if (!auth) return null;
  if (auth.perfil !== 'BIBLIOTECARIO' && auth.perfil !== 'ASSISTENTE') {
    toast('Acesso restrito a administradores e funcionários da biblioteca.', 'err');
    setTimeout(() => window.location.href = '/catalogo.html', 1500);
    return null;
  }
  return auth;
}

function isStaff(auth) {
  return auth && (auth.perfil === 'BIBLIOTECARIO' || auth.perfil === 'ASSISTENTE');
}

function authHeader() {
  const auth = getAuth();
  if (!auth) return '';
  return 'Basic ' + btoa(unescape(encodeURIComponent(auth.email + ':' + auth.senha)));
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = '/index.html';
}

// ── Fetch wrapper ─────────────────────────────────────────────
async function api(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': authHeader() }
  };
  if (body !== null) opts.body = JSON.stringify(body);

  let res;
  try { res = await fetch(path, opts); }
  catch (e) { throw new Error('Sem conexão com o servidor: ' + e.message); }

  if (res.status === 401) {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = '/index.html';
    throw new Error('Sessão expirada.');
  }
  if (res.status === 204) return {};

  const ct   = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();

  // ATUALIZADO: 403 agora lê a mensagem específica retornada pelo
  // AccessDeniedHandler do SecurityConfig (ex.: "Você só pode visualizar
  // seus próprios empréstimos."), em vez de uma mensagem genérica.
  if (!res.ok) {
    const msg = typeof data === 'object'
      ? (data.message || data.error || JSON.stringify(data))
      : (data || `Erro ${res.status}`);
    throw new Error(msg);
  }
  return data;
}

// ── Sidebar ───────────────────────────────────────────────────
function renderSidebar(activePage) {
  const el = document.getElementById('sidebar');
  if (!el) { console.warn('[Sidebar] Elemento #sidebar não encontrado'); return; }

  const auth = getAuth();
  if (!auth) { console.warn('[Sidebar] Auth não encontrado no sessionStorage'); return; }

  const nome     = (auth.nome && auth.nome.trim()) ? auth.nome.trim() : (auth.email || 'Usuário');
  const initials = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => (n[0] || '').toUpperCase())
    .join('') || '?';

  const isBib   = auth.perfil === 'BIBLIOTECARIO';
  const isStf   = isStaff(auth);
  const roleLabel = isBib ? 'Bibliotecário(a)' : auth.perfil === 'ASSISTENTE' ? 'Assistente' : 'Usuário';

  const sections = [
    {
      label: 'Biblioteca',
      items: [
        { page: 'catalogo', icon: 'layout-list', label: 'Catálogo', href: '/catalogo.html' },
      ]
    },
    ...(isBib ? [{
      label: 'Acervo',
      items: [
        { page: 'livros', icon: 'book', label: 'Cadastrar livro', href: '/livros.html' },
      ]
    }] : []),
    {
      label: 'Empréstimos',
      items: [
        { page: 'emprestimo',       icon: 'arrow-forward-up', label: 'Solicitar empréstimo', href: '/emprestimo.html' },
        { page: 'devolver',         icon: 'arrow-back-up',    label: 'Devolver livro',       href: '/devolver.html'   },
        { page: 'meus-emprestimos', icon: 'history',          label: 'Meus empréstimos',     href: '/meus-emprestimos.html' },
        ...(isBib ? [{ page: 'atrasados', icon: 'alert-triangle', label: 'Atrasados', href: '/atrasados.html' }] : []),
      ]
    },
    {
      label: 'Usuários',
      items: [
        { page: 'usuario', icon: 'user-plus', label: 'Novo usuário', href: '/usuario.html' },
        // NOVO: listagem de usuários — visível para BIBLIOTECARIO e ASSISTENTE
        ...(isStf ? [{ page: 'usuarios', icon: 'users', label: 'Listar usuários', href: '/usuarios.html' }] : []),
        ...(isBib ? [{ page: 'funcionario', icon: 'id-badge', label: 'Novo funcionário', href: '/funcionario.html' }] : []),
      ]
    },
    ...(isBib ? [{
      label: 'Financeiro',
      items: [{ page: 'relatorio', icon: 'chart-bar', label: 'Relatório financeiro', href: '/relatorio.html' }]
    }] : []),
  ];

  let navHTML = '';
  for (const section of sections) {
    navHTML += `<div class="nav-label">${section.label}</div>`;
    for (const item of section.items) {
      navHTML += `<a class="nav-item ${item.page === activePage ? 'active' : ''}" href="${item.href}">
                    <i class="ti ti-${item.icon}"></i> ${item.label}
                  </a>`;
    }
  }

  el.innerHTML = `
    <div class="brand">
      <div class="brand-mark">
        <div class="brand-icon"><i class="ti ti-books"></i></div>
        <div>
          <div class="brand-name">Biblioteca</div>
          <div class="brand-sub">Sistema de Gestão</div>
        </div>
      </div>
    </div>
    <nav class="nav">${navHTML}</nav>
    <div class="user-bar">
      <div class="avatar">${initials}</div>
      <div class="user-info">
        <div class="user-name">${nome}</div>
        <div class="user-role">${roleLabel}</div>
      </div>
    </div>`;
}

// ── Utilitários ───────────────────────────────────────────────
let _toastTimer;
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  if (!el) return;
  const icons = { ok: 'circle-check', warn: 'alert-triangle', err: 'alert-circle' };
  el.innerHTML = `<i class="ti ti-${icons[type] || 'info-circle'}"></i> ${msg}`;
  el.className = `toast toast-${type} show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 4000);
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML    = '<i class="ti ti-loader spin"></i> Aguarde...';
    btn.disabled     = true;
  } else {
    if (btn.dataset.orig) btn.innerHTML = btn.dataset.orig;
    btn.disabled = false;
  }
}

function formatBRL(val)  { return 'R$ ' + parseFloat(val || 0).toFixed(2).replace('.', ','); }
function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function today() { return new Date().toISOString().split('T')[0]; }
function clearFields(...ids) {
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

const COVER_COLORS = ['book-cover-teal', 'book-cover-blue', 'book-cover-amber', 'book-cover-pink'];