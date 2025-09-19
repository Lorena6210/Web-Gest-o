import { Request, Response } from 'express';
import pool from '../db';
import { OkPacket, RowDataPacket } from 'mysql2';

export const obterNotasProva = async (req: Request, res: Response) => {
  const { provaId } = req.params;

  const sql = `
    SELECT n.Id, n.Id_Aluno, a.Nome AS NomeAluno, n.Id_Turma, n.Id_Bimestre, n.Valor
    FROM Nota n
    JOIN Aluno a ON n.Id_Aluno = a.Id
    WHERE n.Id_Prova = ?
  `;

  try {
    const [results] = await pool.promise().query<RowDataPacket[]>(sql, [provaId]);
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar notas de prova:', err);
    res.status(500).json({ error: 'Erro ao buscar notas de prova' });
  }
};
export const criarProva = async (req: Request, res: Response) => {
  const { Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina } = req.body;

  if (!Titulo || !DataCriacao || !Id_Professor || !Id_Turma || !Id_Disciplina) {
    return res.status(400).json({ error: 'Campos obrigatórios: Titulo, DataCriacao, Id_Professor, Id_Turma, Id_Disciplina' });
  }

  const sql = `
    INSERT INTO Prova 
      (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.promise().query<OkPacket>(sql, [
      Titulo,
      Descricao || null,
      DataCriacao,
      DataEntrega || null,
      Id_Professor,
      Id_Turma,
      Id_Disciplina
    ]);
    res.status(201).json({ message: 'Prova criada com sucesso', id: result.insertId });
  } catch (err) {
    console.error('Erro ao criar prova:', err);
    res.status(500).json({ error: 'Erro ao criar prova' });
  }
};

export const criarNotaProva = async (req: Request, res: Response) => {
  const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor } = req.body;

  if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Prova || Valor === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor' });
  }

  const sql = `
    INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.promise().query<OkPacket>(sql, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor]);
    res.status(201).json({ message: 'Nota de prova criada com sucesso', id: result.insertId });
  } catch (err) {
    console.error('Erro ao criar nota de prova:', err);
    res.status(500).json({ error: 'Erro ao criar nota de prova' });
  }
};

export const atualizarProva = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Titulo, Descricao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina } = req.body;

  if (!Titulo || !Id_Professor || !Id_Turma || !Id_Disciplina) {
    return res.status(400).json({ error: 'Campos obrigatórios: Titulo, Id_Professor, Id_Turma, Id_Disciplina' });
  }

  const sql = `
    UPDATE Prova
    SET Titulo = ?, Descricao = ?, DataEntrega = ?, Id_Professor = ?, Id_Turma = ?, Id_Disciplina = ?
    WHERE Id = ?
  `;

  try {
    const [result] = await pool.promise().query<OkPacket>(sql, [
      Titulo,
      Descricao || null,
      DataEntrega || null,
      Id_Professor,
      Id_Turma,
      Id_Disciplina,
      id
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }
    res.json({ message: 'Prova atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar prova:', err);
    res.status(500).json({ error: 'Erro ao atualizar prova' });
  }
};

export const deletarProva = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await pool.promise().query<OkPacket>('DELETE FROM Prova WHERE Id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }
    res.json({ message: 'Prova deletada com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar prova:', err);
    res.status(500).json({ error: 'Erro ao deletar prova' });
  }
};

export const obterProvas = async (req: Request, res: Response) => {
  const { turmaId } = req.query;

  const sql = `
    SELECT 
      pr.Id AS id,
      pr.Titulo AS titulo,
      pr.Descricao AS descricao,
      pr.DataCriacao AS dataCriacao,
      pr.DataEntrega AS dataEntrega,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Prova pr
    JOIN Professor p ON pr.Id_Professor = p.Id
    JOIN Turma t ON pr.Id_Turma = t.Id
    JOIN Disciplina d ON pr.Id_Disciplina = d.Id
  `;

const params: number[] = [];

if (typeof turmaId === 'string') {
  params.push(Number(turmaId));
} 

  try {
    const [results] = await pool.promise().query<RowDataPacket[]>(sql, params);
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar provas:", err);
    res.status(500).json({ error: "Erro ao buscar provas" });
  }
};

export const obterProvasPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params;

  const sql = `
    SELECT 
      pr.Id AS id,
      pr.Titulo AS titulo,
      pr.Descricao AS descricao,
      pr.DataCriacao AS dataCriacao,
      pr.DataEntrega AS dataEntrega,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Prova pr
    JOIN Professor p ON pr.Id_Professor = p.Id
    JOIN Turma t ON pr.Id_Turma = t.Id
    JOIN Disciplina d ON pr.Id_Disciplina = d.Id
    WHERE pr.Id_Turma = ?
  `;

  try {
    const [results] = await pool.promise().query<RowDataPacket[]>(sql, [turmaId]);
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar provas:", err);
    res.status(500).json({ error: "Erro ao buscar provas" });
  }
};
