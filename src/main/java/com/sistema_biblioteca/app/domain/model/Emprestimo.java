package com.sistema_biblioteca.app.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "emprestimos")
@Getter
@NoArgsConstructor
public class Emprestimo {

    private static final BigDecimal TAXA_DIARIA = new BigDecimal("2.50");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "livro_id")
    private Livro livro;

    private LocalDate dataEmprestimo;
    private LocalDate dataPrevistaDevolucao;
    private LocalDate dataDevolucao;
    private String status; // ATIVO, DEVOLVIDO, ATRASADO
    private BigDecimal multa;

    public Emprestimo(Usuario usuario, Livro livro,LocalDate dataEmprestimo, LocalDate dataPrevistaDevolucao) {
        this.usuario = usuario;
        this.livro = livro;
        this.dataEmprestimo = dataEmprestimo;
        this.dataPrevistaDevolucao = dataPrevistaDevolucao;
        this.status = "ATIVO";
        this.multa = BigDecimal.ZERO;
    }
    //Regras de de negócio encapsuladas na entidade
    public void devolver(){
        if(!"ATIVO".equals(this.status) && !"ATRASADO".equals(this.status)){
            throw new RuntimeException("Empréstimo já foi devolvido ou não está ativo.");
        }
        this.dataDevolucao = LocalDate.now();
        this.status = "DEVOLVIDO";
        this.multa = calcularMulta();

        // devolve pro estoque
        this.livro.incrementarEstoque();

    }
    private BigDecimal calcularMulta(){
        long diasAtraso= ChronoUnit.DAYS.between(dataPrevistaDevolucao, LocalDate.now());
        return diasAtraso > 0 ? BigDecimal.valueOf(diasAtraso).multiply(TAXA_DIARIA): BigDecimal.ZERO;
    }
    
    
}
