/**
 * relatorio.js — Relatório financeiro de multas.
 * Rota: GET /api/emprestimos/financeiro?dataInicio=&dataFim=
 * Requer perfil BIBLIOTECARIO.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!checkBibliotecario()) return;
  renderSidebar('relatorio');

  // Define o mês corrente como período padrão
  const hoje  = new Date();
  const ini   = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  document.getElementById('rel-inicio').value = ini.toISOString().split('T')[0];
  document.getElementById('rel-fim').value    = hoje.toISOString().split('T')[0];

  carregarRelatorio();
});

async function carregarRelatorio() {
  const inicio = document.getElementById('rel-inicio').value;
  const fim    = document.getElementById('rel-fim').value;

  const params = [];
  if (inicio) params.push(`dataInicio=${inicio}`);
  if (fim)    params.push(`dataFim=${fim}`);
  const url = '/api/emprestimos/financeiro' + (params.length ? '?' + params.join('&') : '');

  const tbody = document.getElementById('rel-tbody');
  tbody.innerHTML = `<tr><td colspan="5" class="table-empty">
    <i class="ti ti-loader spin"></i> Carregando...
  </td></tr>`;

  try {
    const rel   = await api('GET', url);
    const itens = rel.itens || [];
    const total = parseFloat(rel.totalFaturado || 0);

    // Atualiza cards de estatísticas
    document.getElementById('rel-total').textContent = formatBRL(total);
    document.getElementById('rel-qtd').textContent   = itens.length;
    document.getElementById('rel-media').textContent = itens.length
      ? formatBRL(total / itens.length) : '—';
    document.getElementById('rel-maior').textContent = itens.length
      ? formatBRL(Math.max(...itens.map(i => parseFloat(i.valorPago || 0)))) : '—';

    if (itens.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="table-empty">
        Nenhuma multa registrada no período selecionado
      </td></tr>`;
      return;
    }

    tbody.innerHTML = itens.map(item => `
      <tr>
        <td style="font-weight:500">${item.nomeCliente}</td>
        <td>${item.nomeLivro}</td>
        <td>
          ${item.diasAtraso != null
            ? `<span class="badge badge-danger">${item.diasAtraso} dia${item.diasAtraso !== 1 ? 's' : ''}</span>`
            : '—'}
        </td>
        <td style="font-weight:500;color:var(--danger)">${formatBRL(item.valorPago)}</td>
        <td style="color:var(--muted)">${item.dataDevolucao ? formatDate(item.dataDevolucao) : '—'}</td>
      </tr>`).join('');

  } catch (e) {
    toast(e.message, 'err');
    tbody.innerHTML = `<tr><td colspan="5" class="table-empty" style="color:var(--danger)">
      Erro ao carregar o relatório.
    </td></tr>`;
    ['rel-total','rel-qtd','rel-media','rel-maior'].forEach(id =>
      document.getElementById(id).textContent = '—');
  }
}