package com.sistema_biblioteca.app.service.dto;

import java.math.BigDecimal;

/**
 * ATUALIZADO: campos diasAtraso e dataDevolucao adicionados para popular
 * a tabela de multas no relatorio.html sem precisar de uma segunda chamada.
 */
public record ItemFinanceiroDTO(
    String     nomeLivro,
    String     nomeCliente,
    BigDecimal valorPago,
    long       diasAtraso,    // dias entre dataPrevistaDevolucao e dataDevolucao (≥ 0)
    String     dataDevolucao  // ISO date (YYYY-MM-DD), null se ainda não devolvido
) {}