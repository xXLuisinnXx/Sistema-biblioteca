/**
 * emprestimo.js — Solicitar empréstimo.
 *
 * ATUALIZADO: GET /api/usuarios agora é restrito a BIBLIOTECARIO/ASSISTENTE
 * (vide SecurityConfig). Por isso:
 *  - Staff (BIBLIOTECARIO/ASSISTENTE) → vê o campo de busca e pode escolher
 *    QUALQUER usuário para registrar o empréstimo em nome dele.
 *  - Usuário comum (USER) → não vê busca; o empréstimo é sempre para ele
 *    mesmo (auto-selecionado via GET /api/usuarios/me, que é liberado
 *    para qualquer autenticado).
 *
 * Suporta ?livroId=X na URL para pré-selecionar um livro vindo do catálogo.
 */

let selectedUser = null;
let selectedBook = null;
let _userTimer   = null;
let _bookTimer   = null;
let currentAuth  = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentAuth = checkAuth();
  if (!currentAuth) return;

  try { renderSidebar('emprestimo'); } catch (e) { console.error('[Empréstimo] Sidebar:', e); }

  await inicializar();

  // Pré-seleciona livro se vier do catálogo via ?livroId=
  const livroId = new URLSearchParams(window.location.search).get('livroId');
  if (livroId) {
    try {
      const livro = await api('GET', `/api/livros/${livroId}`);
      if (livro) {
        document.getElementById('emp-livro-busca').value = livro.titulo;
        renderLivros([livro]);
        selecionarLivro(livro);
      }
    } catch { /* ignora — usuário pode buscar manualmente */ }
  }
});

async function inicializar() {
  selectedUser = null;
  selectedBook = null;
  document.getElementById('emp-livro-busca').value          = '';
  document.getElementById('emp-livro-resultados').innerHTML  = '';
  document.getElementById('emp-data-emprestimo').value       = today();
  calcularDataDevolucao();

  if (isStaff(currentAuth)) {
    // Staff: mostra busca de usuário, nada selecionado por padrão
    document.getElementById('usuario-busca-wrap').style.display = 'block';
    document.getElementById('emp-usuario-busca').value           = '';
    document.getElementById('emp-usuario-id-display').value      = '';
    document.getElementById('emp-usuario-dropdown').style.display = 'none';
    document.getElementById('emp-usuario-card').style.display     = 'none';
  } else {
    // Usuário comum: busca fica escondida; auto-seleciona o próprio usuário
    document.getElementById('usuario-busca-wrap').style.display = 'none';
    try {
      const me = await api('GET', '/api/usuarios/me');
      selecionarUsuario(me, true);
    } catch (e) {
      toast('Não foi possível carregar seus dados.', 'err');
    }
  }
}

function calcularDataDevolucao() {
  const prazo = parseInt(document.getElementById('emp-prazo').value) || 14;
  const d = new Date();
  d.setDate(d.getDate() + prazo);
  document.getElementById('emp-data-devolucao').value = d.toISOString().split('T')[0];
}

// ── Busca de usuário (apenas staff) ──────────────────────────
function onUsuarioBusca() {
  clearTimeout(_userTimer);
  const busca    = document.getElementById('emp-usuario-busca').value.trim();
  const dropdown = document.getElementById('emp-usuario-dropdown');
  if (busca.length < 2) { dropdown.style.display = 'none'; return; }

  _userTimer = setTimeout(async () => {
    try {
      const usuarios = await api('GET', `/api/usuarios?busca=${encodeURIComponent(busca)}`);
      renderUsuarioDropdown(usuarios);
    } catch (e) { toast(e.message, 'err'); }
  }, 400);
}

function renderUsuarioDropdown(usuarios) {
  const dropdown = document.getElementById('emp-usuario-dropdown');
  if (!usuarios || usuarios.length === 0) {
    dropdown.innerHTML = '<div style="padding:10px 14px;font-size:13px;color:var(--muted)">Nenhum usuário encontrado</div>';
    dropdown.style.display = 'block';
    return;
  }
  dropdown.innerHTML = usuarios.slice(0, 6).map(u => {
    const initials = u.nome.split(' ').filter(Boolean).slice(0,2).map(n=>n[0]).join('');
    return `<div class="book-result" style="margin:0;border-radius:0;border:none;border-bottom:0.5px solid var(--border)"
                 onclick='selecionarUsuario(${JSON.stringify(u).replace(/'/g,"&#39;")})'>
              <div class="avatar" style="background:#B5D4F4;color:#0C447C;width:34px;height:34px;font-size:11px;flex-shrink:0">
                ${initials}
              </div>
              <div class="book-info">
                <div class="book-title">${u.nome}</div>
                <div class="book-meta">${u.email}</div>
              </div>
            </div>`;
  }).join('');
  dropdown.style.display = 'block';
}

/**
 * Define o usuário do empréstimo.
 * @param {object} user        - objeto retornado pela API (id, nome, email, telefone, perfil)
 * @param {boolean} isSelf      - true quando é o próprio usuário (auto-selecionado)
 */
function selecionarUsuario(user, isSelf = false) {
  selectedUser = user;
  const initials = user.nome.split(' ').filter(Boolean).slice(0,2).map(n=>n[0]).join('');

  if (isStaff(currentAuth) && !isSelf) {
    document.getElementById('emp-usuario-busca').value      = user.nome;
    document.getElementById('emp-usuario-id-display').value = `#${user.id}`;
    document.getElementById('emp-usuario-dropdown').style.display = 'none';
  }

  const card = document.getElementById('emp-usuario-card');
  card.style.display = 'flex';
  card.innerHTML = `
    <div class="avatar" style="background:#B5D4F4;color:#0C447C">${initials}</div>
    <div>
      <div style="font-size:13.5px;font-weight:500">${user.nome}${isSelf ? ' (você)' : ''}</div>
      <div style="font-size:12px;color:var(--muted)">${user.email}${user.telefone ? ' · ' + user.telefone : ''}</div>
    </div>
    <span class="badge badge-success" style="margin-left:auto">
      <i class="ti ti-circle-check"></i> ${isSelf ? 'Você' : 'Selecionado'}
    </span>`;
}

document.addEventListener('click', e => {
  if (!e.target.closest('#emp-usuario-busca') && !e.target.closest('#emp-usuario-dropdown')) {
    const dd = document.getElementById('emp-usuario-dropdown');
    if (dd) dd.style.display = 'none';
  }
});

// ── Busca de livro ────────────────────────────────────────────
function onLivroBusca() {
  clearTimeout(_bookTimer);
  const busca = document.getElementById('emp-livro-busca').value.trim();
  if (busca.length < 2) { document.getElementById('emp-livro-resultados').innerHTML = ''; return; }

  _bookTimer = setTimeout(async () => {
    try {
      const page = await api('GET', `/api/livros?busca=${encodeURIComponent(busca)}&size=5`);
      renderLivros(page.content || []);
    } catch (e) { toast(e.message, 'err'); }
  }, 400);
}

function renderLivros(livros) {
  const el = document.getElementById('emp-livro-resultados');
  if (!livros || livros.length === 0) {
    el.innerHTML = '<div style="padding:8px;font-size:13px;color:var(--muted)">Nenhum livro encontrado</div>';
    return;
  }
  el.innerHTML = livros.map((l, i) => {
    const disp      = l.quantidadeDisponivel || 0;
    const pillClass = disp > 2 ? 'avail-ok' : disp > 0 ? 'avail-low' : 'avail-none';
    const pillText  = disp > 0 ? `${disp} disponível${disp !== 1 ? 's' : ''}` : 'Indisponível';
    const isSelected = selectedBook && selectedBook.id === l.id;
    return `<div class="book-result ${isSelected ? 'selected' : ''}"
                 onclick='selecionarLivro(${JSON.stringify(l).replace(/'/g,"&#39;")})'>
              <div class="book-cover ${COVER_COLORS[i % 4]}"><i class="ti ti-book"></i></div>
              <div class="book-info">
                <div class="book-title">${l.titulo}</div>
                <div class="book-meta">${l.autor}${l.editora ? ' · ' + l.editora : ''}</div>
              </div>
              <span class="avail-pill ${pillClass}">${pillText}</span>
            </div>`;
  }).join('');
}

function selecionarLivro(livro) {
  selectedBook = livro;
  document.getElementById('emp-livro-resultados').querySelectorAll('.book-result').forEach(el => {
    el.classList.toggle('selected', el.querySelector('.book-title')?.textContent === livro.titulo);
  });
}

// ── Confirmar empréstimo ──────────────────────────────────────
async function confirmarEmprestimo() {
  if (!selectedUser) { toast('Selecione um usuário.', 'warn'); return; }
  if (!selectedBook) { toast('Selecione um livro.', 'warn');   return; }
  if ((selectedBook.quantidadeDisponivel || 0) <= 0) { toast('Livro indisponível.', 'err'); return; }

  const dataDevolucao = document.getElementById('emp-data-devolucao').value;
  if (!dataDevolucao) { toast('Informe a data de devolução.', 'warn'); return; }

  setLoading('btn-confirmar', true);
  try {
    const e = await api('POST', '/api/emprestimos', {
      usuarioId:             selectedUser.id,
      livroId:               selectedBook.id,
      dataPrevistaDevolucao: dataDevolucao
    });
    toast(`Empréstimo #${e.id} registrado com sucesso!`);
    await inicializar();
    history.replaceState({}, '', '/emprestimo.html');
  } catch (e) {
    toast(e.message, 'err');
  } finally {
    setLoading('btn-confirmar', false);
  }
}

async function resetarFormulario() {
  await inicializar();
  history.replaceState({}, '', '/emprestimo.html');
}