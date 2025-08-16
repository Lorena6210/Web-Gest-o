import { Request, Response } from 'express';
import db from '../db';

export const obterNotasPorBimestre = (req: Request, res: Response) => {
  const { bimestre } = req.params;

  db.query('SELECT * FROM Bimestre_Nota WHERE Id_Bimestre = ?', [bimestre], (err, rows) => {
    if (err) {
      console.error('Erro ao obter notas por bimestre:', err);
      return res.status(500).json({ error: 'Erro ao obter notas por bimestre' });
    }
    res.json(rows);
  });
};
