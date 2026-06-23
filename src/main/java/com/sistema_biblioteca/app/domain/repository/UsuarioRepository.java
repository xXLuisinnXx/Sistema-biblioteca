package com.sistema_biblioteca.app.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sistema_biblioteca.app.domain.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    /** NOVO — busca por nome para o campo de pesquisa da tela de empréstimo. */
    List<Usuario> findByNomeContainingIgnoreCase(String nome);
}