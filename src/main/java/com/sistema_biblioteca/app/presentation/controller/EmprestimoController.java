package com.sistema_biblioteca.app.presentation.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sistema_biblioteca.app.domain.model.Emprestimo;
import com.sistema_biblioteca.app.service.dto.EmprestimoRequest;
import com.sistema_biblioteca.app.service.usecase.EmprestimoService;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @PostMapping
    public ResponseEntity<Emprestimo> emprestar(@RequestBody EmprestimoRequest request) {
        Emprestimo emprestimo = emprestimoService.realizarEmprestimo(request.usuarioId(), request.livroId(), request.dataPrevistaDevolucao());

        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimo);
    }
}
