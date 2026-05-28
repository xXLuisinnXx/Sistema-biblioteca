package com.sistema_biblioteca.app.domain.repository;

import com.sistema_biblioteca.app.domain.model.Livro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LivroRepository extends JpaRepository<Livro, Long> {

    @Query("SELECT l FROM Livro l WHERE " +
        "(:busca IS NULL OR LOWER(l.titulo) LIKE LOWER(CONCAT('%', :busca, '%')) " +
        "OR LOWER(l.autor) LIKE LOWER(CONCAT('%', :busca, '%')))")
    Page<Livro> buscaComFiltro(@Param("busca") String busca, Pageable pageable);
}
