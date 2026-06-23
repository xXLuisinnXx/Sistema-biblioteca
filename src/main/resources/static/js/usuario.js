/**
 * usuario.js — Cadastro de usuário leitor.
 * Rota adicionada ao backend: POST /api/usuarios (requer BIBLIOTECARIO)
 * Perfil fixo: "USER"
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  renderSidebar('usuario');
});

async function cadastrarUsuario() {
  const nome     = document.getElementById('usr-nome').value.trim();
  const email    = document.getElementById('usr-email').value.trim();
  const telefone = document.getElementById('usr-telefone').value.trim();
  const senha    = document.getElementById('usr-senha').value;

  if (!nome || !email || !senha) {
    toast('Nome, e-mail e senha são obrigatórios.', 'warn');
    return;
  }
  if (senha.length < 6) {
    toast('A senha deve ter no mínimo 6 caracteres.', 'warn');
    return;
  }

  const usuario = {
    nome,
    email,
    telefone: telefone || null,
    senha,
    perfil: 'USER'
  };

  setLoading('btn-cadastrar', true);
  try {
    await api('POST', '/api/usuarios', usuario);
    toast(`Usuário "${nome}" cadastrado com sucesso!`);
    limparForm();
  } catch (e) {
    toast(e.message, 'err');
  } finally {
    setLoading('btn-cadastrar', false);
  }
}

function limparForm() {
  clearFields('usr-nome', 'usr-email', 'usr-telefone', 'usr-senha');
}