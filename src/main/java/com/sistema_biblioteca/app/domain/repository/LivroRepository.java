package com.sistema_biblioteca.app.domain.repository;

import com.sistema_biblioteca.app.domain.model.Livro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LivroRepository extends JpaRepository<Livro, Long> {

    /**
     * ATUALIZADO: adicionados filtros de categoria e editora.
     * Todos os parâmetros são opcionais — null desativa o filtro correspondente.
     *
     * - busca:    filtra por título OU autor (like, case-insensitive)
     * - categoria: filtra por categoria exata
     * - editora:  filtra por editora (like, case-insensitive)
     */
    @Query("SELECT l FROM Livro l WHERE " +
           "(:busca    IS NULL OR LOWER(l.titulo) LIKE LOWER(CONCAT('%', :busca, '%')) " +
           "                   OR LOWER(l.autor)  LIKE LOWER(CONCAT('%', :busca, '%'))) " +
           "AND (:categoria IS NULL OR l.categoria = :categoria) " +
           "AND (:editora   IS NULL OR LOWER(l.editora) LIKE LOWER(CONCAT('%', :editora, '%')))")
    Page<Livro> buscaComFiltro(
            @Param("busca")     String busca,
            @Param("categoria") String categoria,
            @Param("editora")   String editora,
            Pageable pageable);
}