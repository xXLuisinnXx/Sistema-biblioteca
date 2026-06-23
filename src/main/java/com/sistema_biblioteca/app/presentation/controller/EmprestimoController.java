package com.sistema_biblioteca.app.presentation.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sistema_biblioteca.app.domain.model.Emprestimo;
import com.sistema_biblioteca.app.domain.model.Usuario;
import com.sistema_biblioteca.app.domain.repository.UsuarioRepository;
import com.sistema_biblioteca.app.service.dto.EmprestimoRequest;
import com.sistema_biblioteca.app.service.dto.RelatorioFinanceiroDTO;
import com.sistema_biblioteca.app.service.usecase.EmprestimoService;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;
    private final UsuarioRepository usuarioRepository;

    public EmprestimoController(EmprestimoService emprestimoService, UsuarioRepository usuarioRepository) {
        this.emprestimoService = emprestimoService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public ResponseEntity<Emprestimo> emprestar(@RequestBody EmprestimoRequest request) {
        Emprestimo emprestimo = emprestimoService.realizarEmprestimo(
                request.usuarioId(),
                request.livroId(),
                request.dataPrevistaDevolucao());
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimo);
    }

    @PutMapping("/{id}/devolver")
    public ResponseEntity<Emprestimo> devolver(@PathVariable Long id) {
        return ResponseEntity.ok(emprestimoService.devolverLivro(id));
    }

    @GetMapping("/atrasados")
    public ResponseEntity<List<Emprestimo>> listarAtrasados() {
        return ResponseEntity.ok(emprestimoService.listarAtrasados());
    }

    /**
     * NOVO — retorna o histórico de empréstimos do usuário autenticado.
     * Usado em meus-emprestimos.html (sem ?usuarioId=).
     * Disponível para qualquer usuário autenticado (USER, ASSISTENTE, BIBLIOTECARIO).
     */
    @GetMapping("/meus")
    public ResponseEntity<List<Emprestimo>> meusEmprestimos(Authentication authentication) {
        Usuario solicitante = usuarioAutenticado(authentication);
        return ResponseEntity.ok(emprestimoService.HistoricoUsuario(solicitante.getId()));
    }

    /**
     * ATUALIZADO — agora verifica permissão antes de retornar o histórico de outro usuário.
     *
     * Regra de acesso:
     *  - BIBLIOTECARIO ou ASSISTENTE → pode ver o histórico de QUALQUER usuário
     *    (usado em usuarios.html → "ver empréstimos")
     *  - USER → só pode ver o PRÓPRIO histórico (usuarioId precisa ser igual ao seu próprio id)
     *
     * Caso contrário, lança AccessDeniedException → Spring Security retorna 403.
     */
    @GetMapping("/usuario/{usuarioId}/historico")
    public ResponseEntity<List<Emprestimo>> historicoUsuario(
            @PathVariable Long usuarioId,
            Authentication authentication) {

        Usuario solicitante = usuarioAutenticado(authentication);

        boolean isStaff = isStaff(solicitante);
        boolean isProprioUsuario = solicitante.getId().equals(usuarioId);

        if (!isStaff && !isProprioUsuario) {
            throw new AccessDeniedException("Você só pode visualizar seus próprios empréstimos.");
        }

        return ResponseEntity.ok(emprestimoService.HistoricoUsuario(usuarioId));
    }

    @GetMapping("/financeiro")
    public ResponseEntity<RelatorioFinanceiroDTO> relatorioFinanceiro(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok(emprestimoService.gerarRelatorioFinanceiro(dataInicio, dataFim));
    }

    // ── Helpers ─────────────────────────────────────────────────

    private Usuario usuarioAutenticado(Authentication authentication) {
        return usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    private boolean isStaff(Usuario usuario) {
        String perfil = usuario.getPerfil();
        return "BIBLIOTECARIO".equals(perfil) || "ASSISTENTE".equals(perfil);
    }
}