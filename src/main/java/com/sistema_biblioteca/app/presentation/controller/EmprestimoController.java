package com.sistema_biblioteca.app.presentation.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sistema_biblioteca.app.domain.model.Emprestimo;
import com.sistema_biblioteca.app.service.dto.EmprestimoRequest;
import com.sistema_biblioteca.app.service.dto.RelatorioFinanceiroDTO;
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

    @GetMapping("/atrasados")
    public ResponseEntity<List<Emprestimo>> listarAtrasados(){
        return ResponseEntity.ok(emprestimoService.listarAtrasados());
    }

    @GetMapping("/usuario/{usuarioId}/historico")
    public ResponseEntity<List<Emprestimo>> HistoricoUsuario(@PathVariable Long usuarioId){
        return ResponseEntity.ok(emprestimoService.HistoricoUsuario(usuarioId));
    }

    @GetMapping("/financeiro")
    public ResponseEntity<RelatorioFinanceiroDTO> relatorioFinanceiro(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim){

            return ResponseEntity.ok(emprestimoService.gerarRelatorioFinanceiro(dataInicio, dataFim));
        }
}
