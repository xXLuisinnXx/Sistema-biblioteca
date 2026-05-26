package com.sistema_biblioteca.app.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sistema_biblioteca.app.domain.model.Emprestimo;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {
    boolean existsByUsuarioIdAndStatus(Long usuarioId, String status);

    List<Emprestimo> findByStatus(String status);
}
