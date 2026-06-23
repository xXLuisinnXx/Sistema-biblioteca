/**
 * catalogo.js — Catálogo de livros com busca, filtros, paginação e modal.
 */

let currentPage      = 0;
let pageSize         = 10;
let totalPages       = 0;
let totalElements    = 0;
let currentBusca     = '';
let currentCategoria = '';
let currentEditora   = '';
let currentLivros    = [];
let selectedLivro    = null;
let _buscaTimer      = null;
let _filtroTimer     = null;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Catálogo] Iniciando...');

  // 1. Verifica autenticação
  const auth = checkAuth();
  if (!auth) return; // checkAuth já redireciona para /index.html

  console.log('[Catálogo] Auth OK → email:', auth.email, '| perfil:', auth.perfil);

  // 2. Sidebar em try-catch ISOLADO — erro aqui não impede os livros de carregar
  try {
    renderSidebar('catalogo');
  } catch (e) {
    console.error('[Catálogo] Erro no renderSidebar:', e);
    // Injeta sidebar mínima de fallback para o usuário pelo menos ver o menu
    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl) {
      sidebarEl.innerHTML = `
        <div class="brand">
          <div class="brand-mark">
            <div class="brand-icon"><i class="ti ti-books"></i></div>
            <div><div class="brand-name">Biblioteca</div></div>
          </div>
        </div>
        <nav class="nav">
          <a class="nav-item active" href="/catalogo.html"><i class="ti ti-layout-list"></i> Catálogo</a>
          <a class="nav-item" href="/emprestimo.html"><i class="ti ti-arrow-forward-up"></i> Empréstimo</a>
          <a class="nav-item" href="/devolver.html"><i class="ti ti-arrow-back-up"></i> Devolver</a>
        </nav>
        <div class="user-bar">
          <div class="avatar">?</div>
          <div class="user-info">
            <div class="user-name">${auth.email}</div>
            <div class="user-role">—</div>
          </div>
        </div>`;
    }
  }

  // 3. Carrega livros em try-catch ISOLADO
  carregarLivros().catch(e => {
    console.error('[Catálogo] Erro em carregarLivros:', e);
    document.getElementById('livros-lista').innerHTML = `
      <div class="empty-state" style="color:var(--danger)">
        <i class="ti ti-alert-circle"></i>
        <div>Erro ao carregar o catálogo</div>
        <div style="font-size:12px;margin-top:6px;color:var(--hint)">${e.message}</div>
      </div>`;
  });
});

// ── Carga de livros ───────────────────────────────────────────
async function carregarLivros() {
  mostrarLoading();

  const params = new URLSearchParams();
  if (currentBusca)     params.append('busca',    currentBusca);
  if (currentCategoria) params.append('categoria', currentCategoria);
  if (currentEditora)   params.append('editora',   currentEditora);
  params.append('page', currentPage);
  params.append('size', pageSize);
  params.append('sort', 'titulo');   // sort simples — sem ",asc" para evitar problemas

  console.log('[Catálogo] Chamando GET /api/livros?' + params.toString());

  const data = await api('GET', `/api/livros?${params}`);

  console.log('[Catálogo] Resposta da API:', data);

  currentLivros = data.content || [];
  totalPages    = data.totalPages    || 0;
  totalElements = data.totalElements || 0;

  document.getElementById('catalogo-count').textContent =
    totalElements > 0
      ? `${totalElements.toLocaleString('pt-BR')} título${totalElements !== 1 ? 's' : ''} encontrado${totalElements !== 1 ? 's' : ''}`
      : 'Nenhum livro encontrado';

  renderLivros(currentLivros);
  renderPaginacao();
}

// ── Render lista ──────────────────────────────────────────────
function renderLivros(livros) {
  const el = document.getElementById('livros-lista');
  if (!livros || livros.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <i class="ti ti-books"></i>
        <div>Nenhum livro encontrado para este filtro</div>
      </div>`;
    return;
  }
  el.innerHTML = livros.map((l, i) => {
    const disponivel = (l.quantidadeDisponivel || 0) > 0;
    const dispBadge  = disponivel
      ? `<span class="badge badge-success"><i class="ti ti-circle-check"></i> Disponível</span>`
      : `<span class="badge badge-danger"><i class="ti ti-circle-x"></i> Indisponível</span>`;
    const coverLetter = (l.titulo || 'L')[0].toUpperCase();
    const meta = [l.editora, l.edicao, l.isbn].filter(Boolean).join(' · ');
    return `
      <div class="livro-row" onclick="abrirModal(${l.id})">
        <div class="book-cover ${COVER_COLORS[i % 4]}"
             style="width:48px;height:64px;border-radius:6px;flex-shrink:0;font-size:22px">
          ${coverLetter}
        </div>
        <div class="livro-body">
          <div class="livro-header">
            <span class="livro-titulo">${l.titulo}</span>
            ${l.anoPublicacao ? `<span class="badge badge-gray">${l.anoPublicacao}</span>` : ''}
          </div>
          <div class="livro-autor">${l.autor || '—'}</div>
          ${meta ? `<div class="livro-meta">${meta}</div>` : ''}
          ${l.sinopse ? `<div class="livro-sinopse">${l.sinopse}</div>` : ''}
        </div>
        <div class="livro-aside">
          ${dispBadge}
          ${l.categoria ? `<span class="badge badge-info">${l.categoria}</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

// ── Modal ─────────────────────────────────────────────────────
function abrirModal(livroId) {
  const livro = currentLivros.find(l => l.id === livroId);
  if (!livro) return;
  selectedLivro = livro;
  popularModal(livro);
  document.getElementById('modal-livro').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharModal(event) {
  if (event && event.target !== document.getElementById('modal-livro')) return;
  document.getElementById('modal-livro').classList.remove('open');
  document.body.style.overflow = '';
  selectedLivro = null;
}

function popularModal(l) {
  document.getElementById('modal-titulo').textContent = l.titulo || '—';

  const tagline = [l.edicao, l.idioma].filter(Boolean).join(' · ');
  const tagEl   = document.getElementById('modal-tagline');
  tagEl.textContent   = tagline;
  tagEl.style.display = tagline ? 'block' : 'none';

  const disp  = l.quantidadeDisponivel || 0;
  const total = l.quantidadeTotal || 0;
  const dispEl = document.getElementById('modal-disponibilidade');
  if (disp > 0) {
    dispEl.className = 'modal-availability modal-avail-ok';
    dispEl.innerHTML = `<i class="ti ti-circle-check"></i> ${disp} de ${total} disponível${disp !== 1 ? 'is' : ''}`;
  } else {
    dispEl.className = 'modal-availability modal-avail-no';
    dispEl.innerHTML = `<i class="ti ti-circle-x"></i> Indisponível no momento`;
  }

  const campos = [
    { label: 'Autor',       value: l.autor },
    { label: 'Editora',     value: l.editora },
    { label: 'Ano',         value: l.anoPublicacao },
    { label: 'Categoria',   value: l.categoria },
    { label: 'Idioma',      value: l.idioma },
    { label: 'ISBN',        value: l.isbn },
    { label: 'Edição',      value: l.edicao },
    { label: 'Localização', value: l.localizacao },
  ].filter(c => c.value);

  document.getElementById('modal-grid').innerHTML = campos
    .map(c => `<div class="modal-field"><label>${c.label}</label><span>${c.value}</span></div>`)
    .join('');

  const sinopseWrap = document.getElementById('modal-sinopse-wrap');
  if (l.sinopse) {
    document.getElementById('modal-sinopse').textContent = l.sinopse;
    sinopseWrap.style.display = 'block';
  } else {
    sinopseWrap.style.display = 'none';
  }

  const btn = document.getElementById('btn-solicitar');
  btn.disabled = disp <= 0;
  btn.title    = disp <= 0 ? 'Livro indisponível' : '';
}

function solicitarEmprestimo() {
  if (!selectedLivro) return;
  window.location.href = `/emprestimo.html?livroId=${selectedLivro.id}`;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('modal-livro').classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── Paginação ─────────────────────────────────────────────────
function renderPaginacao() {
  const html = totalPages > 1 ? buildPaginacaoHTML() : '';
  document.getElementById('paginacao-top').innerHTML = html;
  document.getElementById('paginacao-bot').innerHTML = html;
}

function buildPaginacaoHTML() {
  const pages = [];
  pages.push(`<button class="page-btn" onclick="irParaPagina(${currentPage - 1})"
    ${currentPage === 0 ? 'disabled' : ''}><i class="ti ti-chevron-left"></i></button>`);

  const range = buildPageRange(currentPage, totalPages);
  let prev = null;
  for (const p of range) {
    if (prev !== null && p - prev > 1) pages.push(`<span class="page-ellipsis">…</span>`);
    pages.push(`<button class="page-btn ${p === currentPage ? 'active' : ''}"
      onclick="irParaPagina(${p})">${p + 1}</button>`);
    prev = p;
  }

  pages.push(`<button class="page-btn" onclick="irParaPagina(${currentPage + 1})"
    ${currentPage >= totalPages - 1 ? 'disabled' : ''}><i class="ti ti-chevron-right"></i></button>`);
  return pages.join('');
}

function buildPageRange(current, total) {
  const delta = 2, range = new Set();
  range.add(0); range.add(total - 1);
  for (let i = Math.max(1, current - delta); i <= Math.min(total - 2, current + delta); i++) range.add(i);
  return [...range].sort((a, b) => a - b);
}

function irParaPagina(p) {
  if (p < 0 || p >= totalPages) return;
  currentPage = p;
  carregarLivros();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Filtros ───────────────────────────────────────────────────
function onBuscaChange() {
  clearTimeout(_buscaTimer);
  _buscaTimer = setTimeout(() => {
    currentBusca = document.getElementById('filtro-busca').value.trim();
    currentPage  = 0; carregarLivros();
  }, 450);
}

function onFiltroChange() {
  clearTimeout(_filtroTimer);
  _filtroTimer = setTimeout(() => {
    currentCategoria = document.getElementById('filtro-categoria').value;
    currentEditora   = document.getElementById('filtro-editora').value.trim();
    currentPage = 0; carregarLivros();
  }, 400);
}

function onPerPageChange() {
  pageSize    = parseInt(document.getElementById('per-page').value);
  currentPage = 0; carregarLivros();
}

function limparFiltros() {
  document.getElementById('filtro-busca').value     = '';
  document.getElementById('filtro-categoria').value = '';
  document.getElementById('filtro-editora').value   = '';
  currentBusca = ''; currentCategoria = ''; currentEditora = '';
  currentPage  = 0;  carregarLivros();
}

// ── Helpers ───────────────────────────────────────────────────
function mostrarLoading() {
  document.getElementById('livros-lista').innerHTML =
    `<div class="empty-state"><i class="ti ti-loader spin"></i> Carregando...</div>`;
  document.getElementById('paginacao-top').innerHTML = '';
  document.getElementById('paginacao-bot').innerHTML = '';
}