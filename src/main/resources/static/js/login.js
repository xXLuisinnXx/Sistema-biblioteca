/**
 * login.js — Lógica da tela de login.
 * Após login bem-sucedido redireciona para /catalogo.html (página principal).
 */

(function () {
  if (sessionStorage.getItem(AUTH_KEY)) {
    window.location.href = '/catalogo.html';
  }
})();

document.getElementById('login-email').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('login-senha').focus();
});
document.getElementById('login-senha').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  if (!email || !senha) {
    errEl.textContent = 'Preencha e-mail e senha.';
    return;
  }

  sessionStorage.setItem(AUTH_KEY, JSON.stringify({ email, senha, nome: '', perfil: '' }));
  setLoading('btn-login', true);

  try {
    const me = await api('GET', '/api/usuarios/me');
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({
      email,
      senha,
      nome:   me.nome,
      perfil: me.perfil
    }));
    // Redireciona para o catálogo (página principal pós-login)
    window.location.href = '/catalogo.html';
  } catch {
    sessionStorage.removeItem(AUTH_KEY);
    errEl.textContent = 'E-mail ou senha incorretos.';
    setLoading('btn-login', false);
  }
}