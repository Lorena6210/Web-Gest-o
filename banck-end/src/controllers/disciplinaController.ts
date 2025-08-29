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

// Obter atividades de uma disciplina específica
export const obterAtividadesPorDisciplina = (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = `
    SELECT a.Id, a.Titulo, a.Descricao, a.DataCriacao, a.DataEntrega, p.Nome AS Professor
    FROM Atividade a
    INNER JOIN Professor p ON a.Id_Professor = p.Id
    INNER JOIN Disciplina_Atividade da ON a.Id = da.Id_Atividade
    WHERE da.Id_Disciplina = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar atividades da disciplina' });
    res.json(results);
  });
};
