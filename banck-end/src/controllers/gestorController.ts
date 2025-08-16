import type { Request, Response } from 'express';
import db from '../db';

// Funções de controle para Gestores
export const getGestores = (req: Request, res: Response) => {
  db.query('SELECT * FROM Gestor WHERE Status = "Ativo"', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar gestores' });
    }
    res.json(rows);
  });
};

export const getGestorById = (req: Request, res: Response) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM Gestor
    WHERE (Id = ? OR Nome = ?)
    AND Status = "Ativo"
  `;

  db.query(query, [id, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar gestor' });
    }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'Gestor não encontrado' });
    }

    res.status(200).json(results);
  });
};


export const createGestor = (req: Request, res: Response) => {
  const { Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Cargo, Status } = req.body;
  db.query('INSERT INTO Gestor (Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Cargo, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
  [Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Cargo, Status], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao cadastrar gestor' });
    }
    res.status(201).json({ message: 'Gestor cadastrado com sucesso' });
  });
};

export const updateGestor = (req: Request, res: Response) => {
  const { id } = req.params;
  const { Nome, Telefone, Email } = req.body; // Exemplo de campos que podem ser atualizados
    db.query('UPDATE Gestor SET Nome = ?, Telefone = ?, Email = ? WHERE Id = ?', [Nome, Telefone, Email, id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar gestor' });
      }
        res.json({ message: 'Gestor atualizado com sucesso' });
    });
};

export const activateGestor = (req: Request, res: Response) => {
  const { id } = req.params;

  const query = `
    UPDATE Gestor
    SET Status = 'Ativo'
    WHERE (Id = ? OR Nome = ?) = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ativar gestor' });
    }

    const affectedRows = (result as import('mysql2').ResultSetHeader).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Gestor não encontrado ou já está ativo' });
    }

    res.json({ message: 'Gestor ativado com sucesso' });
  });
};

export const updateGestorFoto = (req: Request, res: Response) => {
  const { id } = req.params;
  const { FotoPerfil } = req.body;
  db.query('UPDATE Gestor SET FotoPerfil = ? WHERE Id = ?', [FotoPerfil, id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar foto do gestor' });
    }
    res.json({ message: 'Foto atualizada com sucesso' });
  });
}

export const deleteGestor = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('UPDATE Gestor SET Status = "Inativo" WHERE Id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao desativar gestor' });
    }
      res.json({ message: 'Gestor desativado com sucesso' });
  });
};