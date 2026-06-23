package com.sistema_biblioteca.app.presentation.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sistema_biblioteca.app.domain.model.Usuario;
import com.sistema_biblioteca.app.domain.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder   passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder   = passwordEncoder;
    }

    /**
     * Cria um novo usuário (leitor ou funcionário).
     * A senha é criptografada antes de persistir.
     * Requer perfil BIBLIOTECARIO (restrito no SecurityConfig).
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> cadastrar(@RequestBody Usuario usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        Usuario salvo = usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(toPublicMap(salvo));
    }

    /**
     * Busca usuários por nome (usado na tela de empréstimo).
     * Sem filtro retorna todos (limitado pelo consumidor).
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> buscar(
            @RequestParam(required = false) String busca) {

        List<Usuario> usuarios = (busca == null || busca.isBlank())
                ? usuarioRepository.findAll()
                : usuarioRepository.findByNomeContainingIgnoreCase(busca);

        List<Map<String, Object>> resultado = usuarios.stream()
                .map(this::toPublicMap)
                .toList();

        return ResponseEntity.ok(resultado);
    }

    /**
     * Retorna os dados do usuário autenticado (usado no login do frontend).
     * Nunca retorna a senha.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(toPublicMap(usuario));
    }

    /** Converte Usuario em Map sem expor a senha. */
    private Map<String, Object> toPublicMap(Usuario u) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",       u.getId());
        map.put("nome",     u.getNome());
        map.put("email",    u.getEmail());
        map.put("telefone", u.getTelefone());
        map.put("perfil",   u.getPerfil());
        return map;
    }
}