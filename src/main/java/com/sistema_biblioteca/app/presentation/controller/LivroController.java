package com.sistema_biblioteca.app.presentation.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.sistema_biblioteca.app.domain.model.Livro;
import com.sistema_biblioteca.app.service.usecase.LivroService;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final LivroService livroService;

    public LivroController(LivroService livroService) {
        this.livroService = livroService;
    }

    @PostMapping
    public ResponseEntity<Livro> cadastrar(@RequestBody Livro livro){
        Livro novoLivro = livroService.cadastrarLivro(livro);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoLivro);
    }

    @GetMapping
    public ResponseEntity<Page<Livro>> listar(@RequestParam(required = false) String busca, @PageableDefault(size = 10, page = 0, sort = "titulo") Pageable pageable) {
        return ResponseEntity.ok(livroService.buscarLivros(busca, pageable));
    }

}
