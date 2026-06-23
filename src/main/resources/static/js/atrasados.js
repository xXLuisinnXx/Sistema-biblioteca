/**
 * atrasados.js — Lista de empréstimos atrasados.
 * Rota: GET /api/emprestimos/atrasados (requer BIBLIOTECARIO no backend)
 */

const TAXA_DIARIA = 2.50; // Deve refletir Emprestimo.TAXA_DIARIA no backend

document.addEventListener('DOMContentLoaded', () => {
  if (!checkBibliotecario()) return;
  renderSidebar('atrasados');
  carregarAtrasados();
});

async function carregarAtrasados() {
  const tbody = document.getElementById('atrasados-tbody');
  tbody.innerHTML = `
    <tr><td colspan="6" class="table-empty">
      <i class="ti ti-loader spin"></i> Carregando...
    </td></tr>`;

  try {
    const lista = await api('GET', '/api/emprestimos/atrasados');

    if (!lista || lista.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="6" class="table-empty">
          <i class="ti ti-circle-check" style="color:#0F6E56"></i>
          Nenhum empréstimo atrasado
        </td></tr>`;
      return;
    }

    const hoje = new Date();
    tbody.innerHTML = lista.map(e => {
      const prevista   = new Date(e.dataPrevistaDevolucao);
      const diasAtraso = Math.max(0, Math.floor((hoje - prevista) / 86400000));
      const multaEst   = diasAtraso * TAXA_DIARIA;

      return `
        <tr>
          <td>
            <div style="font-weight:500">${e.usuario?.nome || '—'}</div>
            <div style="font-size:11px;color:var(--hint)">${e.usuario?.email || ''}</div>
          </td>
          <td>${e.livro?.titulo || '—'}</td>
          <td>${formatDate(e.dataPrevistaDevolucao)}</td>
          <td><span class="badge badge-danger">${diasAtraso} dia${diasAtraso !== 1 ? 's' : ''}</span></td>
          <td style="font-weight:500;color:var(--danger)">${formatBRL(multaEst)}</td>
          <td>
            <button class="btn btn-danger" style="padding:5px 12px;font-size:12px"
                    onclick="devolverEmprestimo(${e.id})">
              <i class="ti ti-arrow-back-up"></i> Devolver
            </button>
          </td>
        </tr>`;
    }).join('');

  } catch (e) {
    toast(e.message, 'err');
    tbody.innerHTML = `
      <tr><td colspan="6" class="table-empty" style="color:var(--danger)">
        Erro ao carregar dados.
      </td></tr>`;
  }
}

async function devolverEmprestimo(id) {
  try {
    const e = await api('PUT', `/api/emprestimos/${id}/devolver`);
    const multa = parseFloat(e.multa || 0);
    toast(
      multa > 0
        ? `Devolvido com multa de ${formatBRL(multa)}.`
        : 'Devolução registrada sem multa.'
    );
    carregarAtrasados(); // Recarrega a lista
  } catch (e) {
    toast(e.message, 'err');
  }
}