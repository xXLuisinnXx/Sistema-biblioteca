package com.sistema_biblioteca.app.service.dto;

import java.time.LocalDate;

public record EmprestimoRequest(
    Long usuarioId,
    Long livroId,
    LocalDate dataPrevistaDevolucao
) {}
