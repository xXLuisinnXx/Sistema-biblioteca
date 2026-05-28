package com.sistema_biblioteca.app.service.dto;

import java.math.BigDecimal;
import java.util.List;

public record RelatorioFinanceiroDTO(
    BigDecimal totalFaturado,
    List<ItemFinanceiroDTO> itens
) {}
