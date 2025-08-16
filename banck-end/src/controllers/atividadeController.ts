// /controllers/atividadeController.ts
import { Request, Response } from 'express';
import db from '../db';

export const obterAtividades = (req: Request, res: Response) => {
  const sql = `
    SELECT a.id, a.titulo, a.descricao, a.resposta, a.professorId, 
           d.nome AS disciplina
    FROM atividades a
    INNER JOIN disciplinas d ON a.disciplinaId = d.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
    res.json(results);
  });
};

export const criarAtividade = (req: Request, res: Response) => {
  const { titulo, descricao, professorId } = req.body;
  db.query('INSERT INTO atividades (titulo, descricao, professorId) VALUES (?, ?, ?)', [titulo, descricao, professorId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao criar atividade' });
    }
    res.status(201).json({ message: 'Atividade criada com sucesso' });
  });
};

export const responderAtividade = (req: Request, res: Response) => {
  const { id } = req.params;
  const { resposta } = req.body;

  db.query('UPDATE atividades SET resposta = ? WHERE id = ?', [resposta, id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao responder atividade' });
    res.json({ message: 'Atividade respondida com sucesso' });
  });
};

export const deletarAtividade = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('DELETE FROM atividades WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar atividade' });
    res.json({ message: 'Atividade deletada com sucesso' });
  });
};

export const atualizarAtividade = (req: Request, res: Response) => {
  const { id } = req.params;
  const { titulo, descricao } = req.body;
  db.query('UPDATE atividades SET titulo = ?, descricao = ? WHERE id = ?', [titulo, descricao, id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao atualizar atividade' });
    res.json({ message: 'Atividade atualizada com sucesso' });
  });
};
