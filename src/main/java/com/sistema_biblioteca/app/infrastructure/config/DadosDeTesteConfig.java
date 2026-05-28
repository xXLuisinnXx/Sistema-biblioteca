package com.sistema_biblioteca.app.infrastructure.config;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.sistema_biblioteca.app.domain.model.Emprestimo;
import com.sistema_biblioteca.app.domain.model.Livro;
import com.sistema_biblioteca.app.domain.model.Usuario;
import com.sistema_biblioteca.app.domain.repository.EmprestimoRepository;
import com.sistema_biblioteca.app.domain.repository.LivroRepository;
import com.sistema_biblioteca.app.domain.repository.UsuarioRepository;

@Configuration
public class DadosDeTesteConfig {
    @Bean
    public CommandLineRunner carregarDados(UsuarioRepository usuarioRepository,
                                           LivroRepository livroRepository,
                                           EmprestimoRepository emprestimoRepository,
                                           PasswordEncoder passwordEncoder) {
        return args -> {
            // Só insere se o banco estiver vazio
            if (usuarioRepository.count() == 0) {
                
                // 1. Criando um Bibliotecário
                Usuario admin = new Usuario();
                admin.setNome("Luisinho");
                admin.setEmail("admin@biblioteca.com");
                admin.setSenha(passwordEncoder.encode("123456")); // Senha criptografada certinha
                admin.setPerfil("BIBLIOTECARIO");
                usuarioRepository.save(admin);

                // 2. Criando um Livro
                Livro livro = new Livro();
                livro.setTitulo("Estrutura de Dados em C");
                livro.setAutor("Filipe");
                livro.setIsbn("111-222-333");
                livro.setQuantidadeTotal(5);
                livro.setQuantidadeDisponivel(4);
                livroRepository.save(livro);

                // 3. Simulando um Empréstimo feito há 10 dias, que deveria ter sido devolvido há 5 dias
                Emprestimo emprestimo = new Emprestimo(
                        admin, 
                        livro, 
                        LocalDate.now().minusDays(10), // Data do empréstimo
                        LocalDate.now().minusDays(5)   // Data prevista de devolução
                );
                emprestimoRepository.save(emprestimo);

                // 4. Executando a devolução HOJE (Isso vai gerar automaticamente 5 dias de multa na nossa regra!)
                emprestimo.devolver();
                emprestimoRepository.save(emprestimo);
            }
        };
    }
}
