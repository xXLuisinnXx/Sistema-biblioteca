package com.sistema_biblioteca.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sistema_biblioteca.app.domain.model.Livro;

public interface LivroRepository extends JpaRepository<Livro, Long> {

}
