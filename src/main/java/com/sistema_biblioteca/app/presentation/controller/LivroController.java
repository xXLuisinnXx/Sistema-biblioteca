package com.sistema_biblioteca.app.presentation.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sistema_biblioteca.app.domain.model.Livro;
import com.sistema_biblioteca.app.domain.repository.LivroRepository;
import com.sistema_biblioteca.app.service.usecase.LivroService;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final LivroService    livroService;
    private final LivroRepository livroRepository;

    public LivroController(LivroService livroService, LivroRepository livroRepository) {
        this.livroService    = livroService;
        this.livroRepository = livroRepository;
    }

    @PostMapping
    public ResponseEntity<Livro> cadastrar(@RequestBody Livro livro) {
        return ResponseEntity.status(HttpStatus.CREATED).body(livroService.cadastrarLivro(livro));
    }

    /**
     * ATUALIZADO: adicionados filtros de categoria e editora.
     * A busca continua em cache (@Cacheable no service),
     * usando a combinação (busca, categoria, editora, pageable) como chave.
     */
    @GetMapping
    public ResponseEntity<Page<Livro>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String editora,
            @PageableDefault(size = 10, page = 0, sort = "titulo") Pageable pageable) {
        return ResponseEntity.ok(livroService.buscarLivros(busca, categoria, editora, pageable));
    }

    /**
     * NOVO: busca livro por ID — usado pelo emprestimo.html para pré-selecionar
     * o livro quando o usuário vem do catálogo via ?livroId=.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        return livroRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}