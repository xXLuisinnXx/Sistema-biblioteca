/**
 * livros.js — Cadastro de livros (POST /api/livros).
 * Requer perfil BIBLIOTECARIO (restrito no backend).
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;
  renderSidebar('livros');
});

async function cadastrarLivro() {
  const titulo  = document.getElementById('livro-titulo').value.trim();
  const autor   = document.getElementById('livro-autor').value.trim();
  const qtdTotal = parseInt(document.getElementById('livro-qtd-total').value);
  const qtdDisp  = parseInt(document.getElementById('livro-qtd-disp').value);

  if (!titulo || !autor) {
    toast('Título e autor são obrigatórios.', 'warn');
    return;
  }
  if (isNaN(qtdTotal) || isNaN(qtdDisp) || qtdTotal < 0 || qtdDisp < 0) {
    toast('Informe quantidades válidas.', 'warn');
    return;
  }
  if (qtdDisp > qtdTotal) {
    toast('Quantidade disponível não pode ser maior que o total.', 'warn');
    return;
  }

  const livro = {
    titulo,
    autor,
    isbn:                document.getElementById('livro-isbn').value.trim()      || null,
    editora:             document.getElementById('livro-editora').value.trim()   || null,
    anoPublicacao:       parseInt(document.getElementById('livro-ano').value)    || null,
    categoria:           document.getElementById('livro-categoria').value        || null,
    idioma:              document.getElementById('livro-idioma').value           || null,
    edicao:              document.getElementById('livro-edicao').value.trim()    || null,
    localizacao:         document.getElementById('livro-localizacao').value.trim() || null,
    sinopse:             document.getElementById('livro-sinopse').value.trim()   || null,
    quantidadeTotal:     qtdTotal,
    quantidadeDisponivel: qtdDisp
  };

  setLoading('btn-cadastrar', true);
  try {
    const criado = await api('POST', '/api/livros', livro);
    toast(`Livro "${criado.titulo}" cadastrado com sucesso!`);
    limparForm();
  } catch (e) {
    toast(e.message, 'err');
  } finally {
    setLoading('btn-cadastrar', false);
  }
}

function limparForm() {
  clearFields(
    'livro-titulo', 'livro-autor', 'livro-isbn', 'livro-editora',
    'livro-ano', 'livro-edicao', 'livro-localizacao', 'livro-sinopse',
    'livro-qtd-total', 'livro-qtd-disp'
  );
  document.getElementById('livro-categoria').value = '';
  document.getElementById('livro-idioma').value    = '';
}