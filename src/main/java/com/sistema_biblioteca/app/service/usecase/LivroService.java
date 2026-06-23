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

    /**
     * Evict total do cache ao cadastrar novo livro,
     * garantindo que o catálogo reflita o novo título.
     */
    @CacheEvict(value = "livros", allEntries = true)
    public Livro cadastrarLivro(Livro livro) {
        return livroRepository.save(livro);
    }

    /**
     * ATUALIZADO: aceita filtros de categoria e editora além da busca textual.
     * @Cacheable usa (busca, categoria, editora, pageable) como chave composta —
     * a mesma combinação de parâmetros reutiliza o resultado em memória
     * sem nova query ao banco.
     */
    @Cacheable(value = "livros")
    public Page<Livro> buscarLivros(String busca, String categoria, String editora, Pageable pageable) {
        return livroRepository.buscaComFiltro(busca, categoria, editora, pageable);
    }
}