package com.sistema_biblioteca.app.infrastructure.security;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring()
                .requestMatchers("/", "/*.html", "/css/**", "/js/**");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // Ferramentas de desenvolvimento
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                // ── Auth pública ────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()

                // ── Livros ──────────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,  "/api/livros/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/livros").hasRole("BIBLIOTECARIO")

                // ── Empréstimos ──────────────────────────────────────────────
                // Mais específicas primeiro
                .requestMatchers(HttpMethod.GET, "/api/emprestimos/atrasados").hasRole("BIBLIOTECARIO")
                .requestMatchers(HttpMethod.GET, "/api/emprestimos/financeiro").hasRole("BIBLIOTECARIO")
                // /meus e /usuario/{id}/historico → qualquer autenticado;
                // a verificação de propriedade (próprio usuário vs. staff) é feita
                // dentro do EmprestimoController (lança AccessDeniedException → 403)
                .requestMatchers("/api/emprestimos/**").authenticated()

                // ── Usuários ──────────────────────────────────────────────────
                // ATENÇÃO À ORDEM: regras mais específicas primeiro.

                // GET /api/usuarios/me → qualquer autenticado (usado no login)
                .requestMatchers(HttpMethod.GET, "/api/usuarios/me").authenticated()

                // GET /api/usuarios (lista completa / busca) → apenas staff
                // (BIBLIOTECARIO ou ASSISTENTE). Usado em usuarios.html e na busca
                // de usuário ao criar empréstimo (tela exclusiva de staff).
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasAnyRole("BIBLIOTECARIO", "ASSISTENTE")

                // Demais GETs sob /api/usuarios/** → autenticado
                .requestMatchers(HttpMethod.GET, "/api/usuarios/**").authenticated()

                // POST /api/usuarios (criar funcionário) → apenas BIBLIOTECARIO
                .requestMatchers(HttpMethod.POST, "/api/usuarios").hasRole("BIBLIOTECARIO")

                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .exceptionHandling(ex -> ex
                
                .authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"message\":\"Não autenticado. Faça login para continuar.\"}");
                })
          
                .accessDeniedHandler(accessDeniedHandler())
            )
            .httpBasic(basic -> {});

        return http.build();
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, exception) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            String msg = exception.getMessage() != null
                    ? exception.getMessage()
                    : "Sem permissão para realizar esta ação.";
            response.getWriter().write("{\"message\":\"" + msg.replace("\"", "'") + "\"}");
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}