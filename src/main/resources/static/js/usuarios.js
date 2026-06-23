/**
 * usuarios.js — Listagem de todos os usuários do sistema.
 * Rota: GET /api/usuarios (restrito a BIBLIOTECARIO / ASSISTENTE no SecurityConfig).
 * Cada linha tem um botão "Ver empréstimos" que leva para
 * meus-emprestimos.html?usuarioId=X&nome=Y (acesso de staff ao histórico de outro usuário).
 */

document.addEventListener('DOMContentLoaded', () => {
  // checkStaff() permite BIBLIOTECARIO ou ASSISTENTE; redireciona caso contrário
  const auth = checkStaff();
  if (!auth) return;

  try { renderSidebar('usuarios'); } catch (e) { console.error('[Usuarios] Sidebar:', e); }

  carregarUsuarios();
});

async function carregarUsuarios() {
  const tbody = document.getElementById('usuarios-tbody');
  tbody.innerHTML = `<tr><td colspan="4" class="table-empty">
    <i class="ti ti-loader spin"></i> Carregando...
  </td></tr>`;

  try {
    // Sem ?busca= → retorna todos os usuários
    const usuarios = await api('GET', '/api/usuarios');

    if (!usuarios || usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="table-empty">
        Nenhum usuário cadastrado.
      </td></tr>`;
      return;
    }

    const perfilBadge = {
      BIBLIOTECARIO: '<span class="badge badge-success"><i class="ti ti-books"></i> Bibliotecário(a)</span>',
      ASSISTENTE:    '<span class="badge badge-info"><i class="ti ti-user-check"></i> Assistente</span>',
      USER:          '<span class="badge badge-gray"><i class="ti ti-user"></i> Usuário</span>',
    };

    tbody.innerHTML = usuarios.map(u => {
      const badge = perfilBadge[u.perfil] || `<span class="badge badge-gray">${u.perfil || '—'}</span>`;
      const nomeEnc = encodeURIComponent(u.nome || '');
      return `
        <tr>
          <td style="font-weight:500">${u.nome}</td>
          <td style="color:var(--muted)">${u.email}</td>
          <td>${badge}</td>
          <td>
            <a class="btn" style="padding:5px 12px;font-size:12px"
               href="/meus-emprestimos.html?usuarioId=${u.id}&nome=${nomeEnc}">
              <i class="ti ti-history"></i> Ver empréstimos
            </a>
          </td>
        </tr>`;
    }).join('');

  } catch (e) {
    toast(e.message, 'err');
    tbody.innerHTML = `<tr><td colspan="4" class="table-empty" style="color:var(--danger)">
      Erro ao carregar usuários.
    </td></tr>`;
  }
}