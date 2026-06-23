/**
 * devolver.js — Devolução de livro.
 * Rota adicionada ao backend: PUT /api/emprestimos/{id}/devolver
 * (EmprestimoService.devolverLivro() existia mas não tinha endpoint REST)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  renderSidebar('devolver');

  // Confirma com Enter no campo de ID
  document.getElementById('dev-id').addEventListener('keydown', e => {
    if (e.key === 'Enter') registrarDevolucao();
  });
});

async function registrarDevolucao() {
  const id = document.getElementById('dev-id').value.trim();
  if (!id) {
    toast('Informe o ID do empréstimo.', 'warn');
    return;
  }

  setLoading('btn-devolver', true);
  document.getElementById('dev-resultado').innerHTML = '';

  try {
    // PUT /api/emprestimos/{id}/devolver
    const e = await api('PUT', `/api/emprestimos/${id}/devolver`);
    renderResultado(e);
    toast('Devolução registrada com sucesso!');
    document.getElementById('dev-id').value = '';
  } catch (e) {
    toast(e.message, 'err');
  } finally {
    setLoading('btn-devolver', false);
  }
}

function renderResultado(e) {
  const multa    = parseFloat(e.multa || 0);
  const atrasado = multa > 0;
  const tipo     = atrasado ? 'alert-warn' : 'alert-ok';
  const icon     = atrasado ? 'alert-triangle' : 'circle-check';
  const multaMsg = atrasado
    ? `<strong style="color:var(--danger)">${formatBRL(multa)}</strong>`
    : '<span style="color:#0F6E56">Sem multa — devolvido no prazo</span>';

  document.getElementById('dev-resultado').innerHTML = `
    <div class="alert-strip ${tipo}" style="margin-top:1.25rem; flex-direction:column; gap:8px">
      <div style="font-weight:500; display:flex; align-items:center; gap:6px">
        <i class="ti ti-${icon}"></i>
        ${atrasado ? 'Devolução com multa' : 'Devolução registrada no prazo'}
      </div>
      <table class="summary-table" style="width:100%; font-size:13px; border-collapse:collapse">
        <tr><td style="padding:3px 0; color:var(--muted); width:160px">Livro</td>
            <td style="font-weight:500">${e.livro?.titulo || '—'}</td></tr>
        <tr><td style="padding:3px 0; color:var(--muted)">Usuário</td>
            <td>${e.usuario?.nome || '—'}</td></tr>
        <tr><td style="padding:3px 0; color:var(--muted)">Data prevista</td>
            <td>${formatDate(e.dataPrevistaDevolucao)}</td></tr>
        <tr><td style="padding:3px 0; color:var(--muted)">Data de devolução</td>
            <td>${formatDate(e.dataDevolucao)}</td></tr>
        <tr style="border-top:0.5px solid var(--border2); margin-top:4px">
            <td style="padding:6px 0 0; color:var(--muted); font-weight:500">Multa</td>
            <td style="padding:6px 0 0">${multaMsg}</td></tr>
      </table>
    </div>`;
}