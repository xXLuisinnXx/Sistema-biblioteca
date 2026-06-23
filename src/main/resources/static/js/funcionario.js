/**
 * funcionario.js — Cadastro de funcionário.
 * Usa a mesma rota POST /api/usuarios, com perfil BIBLIOTECARIO ou ASSISTENTE.
 * Requer que o usuário logado seja BIBLIOTECARIO.
 */

let perfilSelecionado = 'BIBLIOTECARIO'; // padrão: card selecionado na UI

document.addEventListener('DOMContentLoaded', () => {
  if (!checkBibliotecario()) return;
  renderSidebar('funcionario');
});

function selecionarPerfil(card) {
  card.closest('.grid-2').querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  perfilSelecionado = card.dataset.perfil;
}

async function cadastrarFuncionario() {
  const nome     = document.getElementById('func-nome').value.trim();
  const email    = document.getElementById('func-email').value.trim();
  const telefone = document.getElementById('func-telefone').value.trim();
  const senha    = document.getElementById('func-senha').value;

  if (!nome || !email || !senha) {
    toast('Nome, e-mail e senha são obrigatórios.', 'warn');
    return;
  }
  if (senha.length < 6) {
    toast('A senha deve ter no mínimo 6 caracteres.', 'warn');
    return;
  }

  const funcionario = {
    nome,
    email,
    telefone: telefone || null,
    senha,
    perfil: perfilSelecionado
  };

  setLoading('btn-cadastrar', true);
  try {
    await api('POST', '/api/usuarios', funcionario);
    toast(`Funcionário "${nome}" (${perfilSelecionado}) cadastrado com sucesso!`);
    limparForm();
  } catch (e) {
    toast(e.message, 'err');
  } finally {
    setLoading('btn-cadastrar', false);
  }
}

function limparForm() {
  clearFields('func-nome', 'func-email', 'func-telefone', 'func-senha');
}