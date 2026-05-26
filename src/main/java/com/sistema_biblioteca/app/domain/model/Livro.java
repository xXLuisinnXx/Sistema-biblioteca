package com.sistema_biblioteca.app.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "livros")
@Getter
@Setter
@NoArgsConstructor
public class Livro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private String autor;

    private String isbn;
    private Integer quantidadeTotal;
    private Integer quantidadeDisponivel;

    public void decrementarEstoque(){
        if(this.quantidadeDisponivel <= 0){
            throw new RuntimeException("Livro indisponível para empréstimo.");
        }
        this.quantidadeDisponivel--;
    }

    public void incrementarEstoque(){
        if(this.quantidadeDisponivel >= this.quantidadeTotal){
            throw new RuntimeException("Quantidade disponível não pode exceder a quantidade total.");
        }
        this.quantidadeDisponivel++;
    }
}
