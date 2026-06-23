/**
 * meus-emprestimos.js — Histórico de empréstimos (próprio ou de outro usuário).
 *
 * Sem parâmetros na URL:
 *   GET /api/emprestimos/meus → histórico do próprio usuário autenticado.
 *
 * Com ?usuarioId=X&nome=Y:
 *   GET /api/emprestimos/usuario/{X}/historico → histórico do usuário X.
 *   - Permitido para BIBLIOTECARIO/ASSISTENTE (qualquer X)
 *   - Permitido para o próprio usuário (X == seu próprio id)
 *   - Caso contrário, a API retorna 403 e o frontend redireciona
 *     para o próprio histórico com um aviso.
 */

let viewingUsuarioId = null;
let currentAuth      = null;

document.addEventListener('DOMContentLoaded', () => {
  currentAuth = checkAuth();
  if (!currentAuth) return;

  try { renderSidebar('meus-emprestimos'); } catch (e) { console.error('[Histórico] Sidebar:', e); }

  const params = new URLSearchParams(window.location.search);
  viewingUsuarioId = params.get('usuarioId');
  const nomeParam  = params.get('nome');

  if (viewingUsuarioId) {
    document.getElementById('page-title').textContent =
      nomeParam ? `Empréstimos de ${decodeURIComponent(nomeParam)}` : 'Empréstimos do usuário';
    document.getElementById('page-desc').textContent =
      'Histórico completo de empréstimos deste usuário';

    // Botão de devolução inline só aparece para staff visualizando outro usuário
    if (isStaff(currentAuth)) {
      document.getElementById('th-acao').style.display = '';
      document.getElementById('link-voltar').style.display = 'inline-flex';
    }
  }

  carregarEmprestimos();
});

function recarregar() {
  carregarEmprestimos();
}

async function carregarEmprestimos() {
  const tbody = document.getElementById('emp-tbody');
  const colspan = isStaff(currentAuth) && viewingUsuarioId ? 7 : 6;
  tbody.innerHTML = `<tr><td colspan="${colspan}" class="table-empty">
    <i class="ti ti-loader spin"></i> Carregando...
  </td></tr>`;

  const url = viewingUsuarioId
    ? `/api/emprestimos/usuario/${viewingUsuarioId}/historico`
    : '/api/emprestimos/meus';

  try {
    const lista = await api('GET', url);
    renderTabela(lista, colspan);
    atualizarStats(lista);
  } catch (e) {
    // 403 ao tentar ver histórico de outro usuário sem permissão
    if (e.message.toLowerCase().includes('própri') || e.message.toLowerCase().includes('permiss')) {
      toast('Você não tem permissão para ver os empréstimos deste usuário. Mostrando os seus.', 'warn');
      viewingUsuarioId = null;
      history.replaceState({}, '', '/meus-emprestimos.html');
      document.getElementById('page-title').textContent = 'Meus empréstimos';
      document.getElementById('page-desc').textContent  = 'Histórico de empréstimos finalizados e em andamento';
      document.getElementById('th-acao').style.display      = 'none';
      document.getElementById('link-voltar').style.display  = 'none';
      carregarEmprestimos();
      return;
    }

    toast(e.message, 'err');
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="table-empty" style="color:var(--danger)">
      Erro ao carregar empréstimos.
    </td></tr>`;
  }
}

function renderTabela(lista, colspan) {
  const tbody = document.getElementById('emp-tbody');

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="table-empty">
      <i class="ti ti-books"></i> Nenhum empréstimo encontrado.
    </td></tr>`;
    return;
  }

  const statusBadge = {
    ATIVO:     '<span class="badge badge-info"><i class="ti ti-clock"></i> Ativo</span>',
    ATRASADO:  '<span class="badge badge-danger"><i class="ti ti-alert-triangle"></i> Atrasado</span>',
    DEVOLVIDO: '<span class="badge badge-success"><i class="ti ti-circle-check"></i> Devolvido</span>',
  };

  const mostrarAcao = isStaff(currentAuth) && viewingUsuarioId;

  // Ordena por data de empréstimo, mais recente primeiro
  const ordenada = [...lista].sort((a, b) =>
    (b.dataEmprestimo || '').localeCompare(a.dataEmprestimo || ''));

  tbody.innerHTML = ordenada.map(e => {
    const multa = parseFloat(e.multa || 0);
    const podeDevolver = e.status === 'ATIVO' || e.status === 'ATRASADO';

    let acaoCell = '';
    if (mostrarAcao) {
      acaoCell = podeDevolver
        ? `<button class="btn btn-danger" style="padding:5px 12px;font-size:12px"
                    onclick="devolverEmprestimo(${e.id})">
             <i class="ti ti-arrow-back-up"></i> Devolver
           </button>`
        : `<span style="color:var(--hint);font-size:12px">—</span>`;
    }

    return `
      <tr>
        <td>
          <div style="font-weight:500">${e.livro?.titulo || '—'}</div>
          <div style="font-size:11px;color:var(--hint)">${e.livro?.autor || ''}</div>
        </td>
        <td>${formatDate(e.dataEmprestimo)}</td>
        <td>${formatDate(e.dataPrevistaDevolucao)}</td>
        <td>${e.dataDevolucao ? formatDate(e.dataDevolucao) : '—'}</td>
        <td>${statusBadge[e.status] || `<span class="badge badge-gray">${e.status || '—'}</span>`}</td>
        <td style="${multa > 0 ? 'color:var(--danger);font-weight:500' : 'color:var(--hint)'}">
          ${multa > 0 ? formatBRL(multa) : '—'}
        </td>
        ${mostrarAcao ? `<td>${acaoCell}</td>` : ''}
      </tr>`;
  }).join('');
}

function atualizarStats(lista) {
  const total     = lista.length;
  const ativos    = lista.filter(e => e.status === 'ATIVO').length;
  const atrasados = lista.filter(e => e.status === 'ATRASADO').length;
  const totalMultas = lista.reduce((sum, e) => sum + parseFloat(e.multa || 0), 0);

  document.getElementById('stat-total').textContent     = total;
  document.getElementById('stat-ativos').textContent    = ativos;
  document.getElementById('stat-atrasados').textContent = atrasados;
  document.getElementById('stat-multas').textContent    = formatBRL(totalMultas);
}

async function devolverEmprestimo(id) {
  try {
    const e = await api('PUT', `/api/emprestimos/${id}/devolver`);
    const multa = parseFloat(e.multa || 0);
    toast(multa > 0 ? `Devolvido com multa de ${formatBRL(multa)}.` : 'Devolução registrada sem multa.');
    carregarEmprestimos();
  } catch (e) {
    toast(e.message, 'err');
  }
}