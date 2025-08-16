// /controllers/disciplinaController.ts
import { Request, Response } from 'express';
import db from '../db';

export const criarDisciplina = (req: Request, res: Response) => {
  const { nome } = req.body;
  db.query('INSERT INTO disciplina (nome) VALUES (?)', [nome], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao criar disciplina' });
    }
    res.status(201).json({ message: 'Disciplina criada com sucesso' });
  });
};


export const obterDisciplinas = (req: Request, res: Response) => {
  db.query('SELECT * FROM disciplina', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
    res.json(results);
  });
}

export const deletarDisciplina = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('DELETE FROM disciplina WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar disciplina' });
    res.json({ message: 'Disciplina deletada com sucesso' });
  });
};
