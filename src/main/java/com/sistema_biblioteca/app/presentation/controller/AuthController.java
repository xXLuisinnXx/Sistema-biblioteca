package com.sistema_biblioteca.app.presentation.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sistema_biblioteca.app.domain.model.Usuario;
import com.sistema_biblioteca.app.domain.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder   passwordEncoder;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder   = passwordEncoder;
    }

    /**
     * Auto-cadastro público (sem autenticação).
     * Perfil é sempre "USER" — impede que alguém se auto-promova a BIBLIOTECARIO.
     * SecurityConfig libera este endpoint com permitAll().
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        if (usuario.getNome() == null || usuario.getNome().isBlank() ||
            usuario.getEmail() == null || usuario.getEmail().isBlank() ||
            usuario.getSenha() == null || usuario.getSenha().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Nome, e-mail e senha (mín. 6 caracteres) são obrigatórios."));
        }

        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Este e-mail já está cadastrado."));
        }

        // Força perfil USER — auto-cadastro nunca vira BIBLIOTECARIO
        usuario.setPerfil("USER");
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        Usuario salvo = usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id",     salvo.getId(),
                "nome",   salvo.getNome(),
                "email",  salvo.getEmail(),
                "perfil", salvo.getPerfil()
        ));
    }
}