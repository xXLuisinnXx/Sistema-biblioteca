package com.sistema_biblioteca.app.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    /**
     * CORRIGIDO: WRITE_ONLY permite receber a senha no corpo da requisição
     * (POST /api/usuarios) mas impede que ela apareça em qualquer resposta JSON
     * — inclusive dentro de objetos Emprestimo serializados.
     */
    @JsonProperty(access = Access.WRITE_ONLY)
    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private String nome;

    private String telefone;
    private String perfil; // "BIBLIOTECARIO", "ASSISTENTE", "USER"
}