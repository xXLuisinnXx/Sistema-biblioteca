package com.sistema_biblioteca.app.service.dto;

import java.math.BigDecimal;

public record ItemFinanceiroDTO(
    String nomeLivro,
    String nomeCliente,
    BigDecimal valorPago
) {}
