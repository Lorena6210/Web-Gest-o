// /controllers/notaController.ts
import { Request, Response } from 'express';
import db from '../db';
import { RowDataPacket } from 'mysql2';


export const obterNotasPorAluno = (req: Request, res: Response) => {
  const { alunoId } = req.params;
  db.query('SELECT * FROM notas WHERE alunoId = ?', [alunoId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar notas' });
    res.json(results);
  });
};

export const obterNotasPorDisciplina = (req: Request, res: Response) => {
  const { disciplinaId } = req.params;
  db.query('SELECT * FROM notas WHERE disciplinaId = ?', [disciplinaId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar notas' });
    res.json(results);
  });
};

export const obterNotasPorProfessor = (req: Request, res: Response) => {
  const { professorId } = req.params;
  db.query('SELECT * FROM notas WHERE professorId = ?', [professorId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar notas' });
    res.json(results);
  });
};

export const obterNotasPorTurma = (req: Request, res: Response) => {
  const { turmaId } = req.params;
  db.query('SELECT * FROM notas WHERE turmaId = ?', [turmaId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar notas' });
    res.json(results);
  });
};

export const obterNotas = (req: Request, res: Response) => {
  db.query('SELECT * FROM notas', (err, results) => {
    if (err) {
      console.error('Erro ao buscar notas:', err); // Log do erro
      return res.status(500).json({ error: 'Erro ao buscar notas' });
    }
    console.log('Notas encontradas:', results); // Log dos resultados
    res.json(results);
  });
};


export const obterNotaPorId = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('SELECT * FROM notas WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar nota' });
    res.json(results);
  });
};

export const atualizarNota = (req: Request, res: Response) => {
  const { id } = req.params;
  const { valor } = req.body;

  const selectQuery = 'SELECT valor FROM notas WHERE id = ?';
  const updateQuery = 'UPDATE notas SET valor = ? WHERE id = ?';

  db.query(selectQuery, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar nota' });

    // Cast explícito do resultado para garantir acesso a `length` e `valor`
    const rows = results as RowDataPacket[];

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }

    const notaAtual = rows[0].valor;

    if (valor < notaAtual) {
      return res.status(400).json({ error: 'Não é permitido diminuir a nota' });
    }

    db.query(updateQuery, [valor, id], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar nota' });
      res.json({ message: 'Nota atualizada com sucesso' });
    });
  });
};

export const deletarNota = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('DELETE FROM notas WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar nota' });
    res.json({ message: 'Nota deletada com sucesso' });
  });
};

export const criarNota = (req: Request, res: Response) => {
  const { alunoId, valor, professorId } = req.body;
  db.query('INSERT INTO notas (alunoId, valor, professorId) VALUES (?, ?, ?)', [alunoId, valor, professorId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao criar nota' });
    }
    res.status(201).json({ message: 'Nota criada com sucesso' });
  });
};