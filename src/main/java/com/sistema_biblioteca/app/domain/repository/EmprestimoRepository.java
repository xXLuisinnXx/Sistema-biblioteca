package com.sistema_biblioteca.app.domain.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sistema_biblioteca.app.domain.model.Emprestimo;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    boolean existsByUsuarioIdAndStatus(Long usuarioId, String status);

    List<Emprestimo> findByStatus(String status);

    List<Emprestimo> findByUsuarioId(Long usuarioId);

    /**
     * CORRIGIDO: a query original concatenava 'DEVOLVIDO'"AND sem espaço,
     * gerando JPQL inválido → "...status = 'DEVOLVIDO'AND ..." causava
     * erro de parse no Hibernate.
     * Solução: espaço adicionado ao final da primeira linha + WHERE em maiúsculas.
     */
    @Query("SELECT e FROM Emprestimo e WHERE e.status = 'DEVOLVIDO' " +
           "AND (:dataInicio IS NULL OR e.dataDevolucao >= :dataInicio) " +
           "AND (:dataFim    IS NULL OR e.dataDevolucao <= :dataFim)")
    List<Emprestimo> buscarParaRelatorioFinanceiro(
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim")    LocalDate dataFim);
}