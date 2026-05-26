package com.sistema_biblioteca.app.service.usecase;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sistema_biblioteca.app.domain.model.Emprestimo;
import com.sistema_biblioteca.app.domain.model.Livro;
import com.sistema_biblioteca.app.domain.model.Usuario;
import com.sistema_biblioteca.app.domain.repository.EmprestimoRepository;
import com.sistema_biblioteca.app.domain.repository.LivroRepository;
import com.sistema_biblioteca.app.domain.repository.UsuarioRepository;

@Service
public class EmprestimoService {

    private final EmprestimoRepository emprestimoRepository;
    private final LivroRepository livroRepository;
    private final UsuarioRepository usuarioRepository;
    
    public EmprestimoService(EmprestimoRepository emprestimoRepository, LivroRepository livroRepository, UsuarioRepository usuarioRepository) {
        this.emprestimoRepository = emprestimoRepository;
        this.livroRepository = livroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Emprestimo realizarEmprestimo(Long usuarioId, Long livroId, LocalDate dataPrevistaDevolucao){
        
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        Livro livro = livroRepository.findById(livroId).orElseThrow(() -> new RuntimeException("Livro não encontrado"));
        if(emprestimoRepository.existsByUsuarioIdAndStatus(usuarioId, "ATRASADO")){
            throw new RuntimeException("Usuário possui empréstimos atrasados e não pode realizar novos empréstimos");
        }
        livro.decrementarEstoque();

        Emprestimo emprestimo = new Emprestimo(usuario, livro,LocalDate.now(), dataPrevistaDevolucao);
        return emprestimoRepository.save(emprestimo);
    }

    @Transactional
    public Emprestimo devolverLivro(Long emprestimoId){
        Emprestimo emprestimo = emprestimoRepository.findById(emprestimoId).orElseThrow(() -> new RuntimeException("Empréstimo não encontrado"));
        emprestimo.devolver();
        return emprestimoRepository.save(emprestimo);
    }

    public List<Emprestimo> listarAtrasados(){
        return emprestimoRepository.findByStatus("ATRASADO");
    }

    public List<Emprestimo> HistoricoUsuario(Long usuarioId){
        return emprestimoRepository.findByUsuarioId(usuarioId);
    }
}
