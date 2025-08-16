// /controllers/historicoMedicoController.ts
import { Request, Response } from 'express';
import db from '../db';

export const criarHistoricoMedico = (req: Request, res: Response) => {
  const { alunoId, descricao } = req.body;
  db.query('INSERT INTO historico_medico (alunoId, descricao) VALUES (?, ?)', [alunoId, descricao], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao criar histórico médico' });
    }
    res.status(201).json({ message: 'Histórico médico criado com sucesso' });
  });
};

export const obterHistoricoMedico = (req: Request, res: Response) => {
  const { alunoId } = req.params;
  db.query('SELECT * FROM historico_medico WHERE alunoId = ?', [alunoId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar histórico médico' });
    res.json(results);
  });
};

export const deletarHistoricoMedico = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('DELETE FROM historico_medico WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar histórico médico' });
    res.json({ message: 'Histórico médico deletado com sucesso' });
  });
};
