# 📚 Sistema de Gestão de Biblioteca

> Sistema web completo para gerenciamento de acervo, empréstimos e usuários de uma biblioteca.

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6-6DB33F?style=flat&logo=springsecurity&logoColor=white)
![H2](https://img.shields.io/badge/H2-Database-1E4D8C?style=flat)
![HTML/CSS/JS](https://img.shields.io/badge/Frontend-HTML%20%2F%20CSS%20%2F%20JS-E44D26?style=flat&logo=html5&logoColor=white)

---

**Credenciais de teste:**

| Perfil | E-mail | Senha |
|---|---|---|
| Bibliotecário(a) | admin@biblioteca.com | 123456 |

---

## ✨ Funcionalidades

### Para qualquer usuário autenticado
- 📖 **Catálogo** — busca por título/autor, filtra por categoria e editora, paginação configurável
- 📋 **Meus empréstimos** — histórico completo com status e multas
- 🔄 **Solicitar / Devolver** empréstimos com cálculo automático de multa (R$ 2,50/dia)

### Para Bibliotecários e Assistentes
- 👥 **Listar usuários** com acesso ao histórico de cada um
- ⚠️ **Empréstimos atrasados** com devolução direta na tela

### Exclusivo para Bibliotecários
- 📚 **Cadastrar livros** com controle de estoque
- 👤 **Cadastrar funcionários** (Bibliotecário ou Assistente)
- 📊 **Relatório financeiro** de multas por período

---

## 🏗️ Arquitetura

```
src/
└── main/
    ├── java/com/sistema_biblioteca/app/
    │   ├── domain/
    │   │   ├── model/          ← Entidades JPA (Livro, Emprestimo, Usuario)
    │   │   └── repository/     ← Spring Data JPA Repositories
    │   ├── service/
    │   │   ├── dto/            ← Records de request/response
    │   │   └── usecase/        ← Regras de negócio (Service layer)
    │   ├── presentation/
    │   │   └── controller/     ← REST Controllers
    │   └── infrastructure/
    │       ├── config/         ← Dados de teste (CommandLineRunner)
    │       └── security/       ← Spring Security (Basic Auth)
    └── resources/
        └── static/             ← Frontend (HTML + CSS + JS puro)
```

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Java 21, Spring Boot 3, Spring Security 6 |
| Persistência | Spring Data JPA, H2 (in-memory) |
| Cache | Spring Cache (ConcurrentHashMap) |
| Frontend | HTML5, CSS3, JavaScript (sem frameworks) |
| Autenticação | HTTP Basic Auth com sessão no sessionStorage |
| Build | Apache Maven |

---

## 🔐 Controle de acesso (por endpoint)

| Endpoint | USER | ASSISTENTE | BIBLIOTECARIO |
|---|---|---|---|
| `GET /api/livros` | ✅ | ✅ | ✅ |
| `GET /api/emprestimos/meus` | ✅ | ✅ | ✅ |
| `GET /api/emprestimos/usuario/{id}/historico` | 🔒 só o próprio | ✅ | ✅ |
| `GET /api/usuarios` (listar todos) | ❌ | ✅ | ✅ |
| `GET /api/emprestimos/atrasados` | ❌ | ❌ | ✅ |
| `GET /api/emprestimos/financeiro` | ❌ | ❌ | ✅ |
| `POST /api/livros` | ❌ | ❌ | ✅ |
| `POST /api/usuarios` | ❌ | ❌ | ✅ |
| `POST /api/auth/register` | 🌐 público | — | — |

---

## 🚀 Rodando localmente

### Pré-requisitos
- Java 21+
- Maven 3.8+

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/sistema-biblioteca.git
cd sistema-biblioteca

# 2. Execute
./mvnw spring-boot:run
# ou: mvn spring-boot:run

# 3. Acesse
# Sistema:    http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
#             JDBC URL: jdbc:h2:mem:biblioteca
```

O sistema já inicia com dados de exemplo (1 livro, 1 administrador, 1 empréstimo com multa).

---

## 📡 Principais endpoints REST

```
POST   /api/auth/register              ← cadastro público
GET    /api/livros                     ← catálogo com paginação e filtros
GET    /api/livros/{id}                ← detalhe do livro
POST   /api/livros                     ← cadastrar livro (BIBLIOTECARIO)
POST   /api/emprestimos                ← solicitar empréstimo
PUT    /api/emprestimos/{id}/devolver  ← registrar devolução + multa
GET    /api/emprestimos/meus           ← histórico do usuário logado
GET    /api/emprestimos/atrasados      ← lista de atrasados (BIBLIOTECARIO)
GET    /api/emprestimos/financeiro     ← relatório de multas (BIBLIOTECARIO)
GET    /api/usuarios                   ← listar usuários (staff)
GET    /api/usuarios/me                ← dados do usuário logado
POST   /api/usuarios                   ← criar usuário/funcionário
```

---
- LinkedIn: [seu-linkedin](https://linkedin.com/in/seu-linkedin)

Desenvolvido como projeto prático da disciplina de **Engenharia de Software** — UCB 2026.
