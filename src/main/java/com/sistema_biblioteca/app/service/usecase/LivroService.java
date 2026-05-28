package com.sistema_biblioteca.app.service.usecase;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.sistema_biblioteca.app.domain.model.Livro;
import com.sistema_biblioteca.app.domain.repository.LivroRepository;

@Service
public class LivroService {

    private final LivroRepository livroRepository;
    public LivroService(LivroRepository livroRepository) {
        this.livroRepository = livroRepository;
    }

    @CacheEvict(value = "livros", allEntries = true)
    public Livro cadastrarLivro(Livro livro){
        return livroRepository.save(livro);
    }

    @Cacheable(value = "livros")
    public Page<Livro> buscarLivros(String busca, Pageable pageable) {
        return livroRepository.buscaComFiltro(busca, pageable);
    }

}
