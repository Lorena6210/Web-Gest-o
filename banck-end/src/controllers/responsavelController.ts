import type { Request, Response } from 'express';
import db from '../db';

// Funções de controle para Responsáveis
export const getResponsaveis = (req: Request, res: Response) => {
  db.query('SELECT * FROM Responsavel WHERE Status = "Ativo"', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar responsáveis' });
    }
    res.json(rows);
  });
};

export const getResponsavelById = (req: Request, res: Response) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM  Responsavel
    WHERE (Id = ? OR Nome = ?)
    AND Status = "Ativo"
  `;

  db.query(query, [id, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar gestor' });
    }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'Responsável cadastrado com sucesso'});
    }

    res.status(200).json(results);
  });
};

export const createResponsavel = (req: Request, res: Response) => {
  const { Nome, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Parentesco } = req.body;

  db.query(
    'INSERT INTO Responsavel (Nome, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Parentesco) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [Nome, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Parentesco], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: `Erro ao cadastrar responsável: ${err.message}` });
      }

      res.status(201).json({ message: 'Responsável cadastrado com sucesso' });
    }
  );
};

export const updateResponsavel = (req: Request, res: Response) => {
  const { id } = req.params;
  const { Nome, Telefone, Email } = req.body; // Exemplo de campos que podem ser atualizados
  db.query('UPDATE Responsavel SET Nome = ?, Telefone = ?, Email = ? WHERE Id = ?', [Nome, Telefone, Email, id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar responsável' });
    }
    res.json({ message: 'Responsável atualizado com sucesso' });
  });
};

export const activateResponsavel = (req: Request, res: Response) => {
  const { id } = req.params;

  db.query('UPDATE Responsavel SET Status = "Ativo" WHERE (Id = ? OR Nome = ?) = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ativar responsável' });
    }

    if (!result) {
      return res.status(404).json({ error: 'Responsável não encontrado' });
    }

    res.json({ message: 'Responsável ativado com sucesso' });
  });
};

export const deleteResponsavel = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('UPDATE Responsavel SET Status = "Inativo" WHERE Id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao desativar responsável' });
    }
    res.json({ message: 'Responsável desativado com sucesso' });
  });
};

export const getAlunosByResponsavel = (req: Request, res: Response) => {
  const { id } = req.params; // id do responsável
  const query = `
    SELECT a.*
    FROM Aluno a
    JOIN Aluno_Responsavel ar ON a.Id = ar.Id_Aluno
    WHERE ar.Id_Responsavel = ?
      AND ar.Status = 'Ativo'
      AND a.Status = 'Ativo'
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar alunos do responsável' });
    }
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'Nenhum aluno encontrado para este responsável' });
    }
    res.status(200).json(results);
  });
};
