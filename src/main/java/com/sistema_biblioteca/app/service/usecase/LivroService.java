package com.sistema_biblioteca.app.service.usecase;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sistema_biblioteca.app.domain.model.Livro;
import com.sistema_biblioteca.app.domain.repository.LivroRepository;

@Service
public class LivroService {

    private final LivroRepository livroRepository;
    public LivroService(LivroRepository livroRepository) {
        this.livroRepository = livroRepository;
    }

    public Livro cadastrarLivro(Livro livro){
        return livroRepository.save(livro);
    }

    public List<Livro> listarTodos(){
        return livroRepository.findAll();
    }
}
