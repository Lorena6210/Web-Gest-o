import { Request, Response } from 'express';
import pool from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const obterNotasPorAluno = async (req: Request, res: Response) => {
  const { alunoId } = req.params;

  const query = `
    SELECT n.*, a.Titulo AS atividadeTitulo, b.Nome AS bimestreNome, al.Nome AS alunoNome, d.Nome AS disciplinaNome
    FROM Nota n
    JOIN Atividade a ON n.Id_Atividade = a.Id
    JOIN Bimestre b ON a.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Disciplina d ON a.Id_Disciplina = d.Id
    WHERE n.Id_Aluno = ?
  `;

  try {
    const [result] = await pool.promise().query<RowDataPacket[]>(query, [alunoId]);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar notas por aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar notas por aluno' });
  }
};

// Similar para obterNotasPorDisciplina, obterNotasPorProfessor, obterNotasPorTurma, obterNotas, obterNotaPorId

export const criarNota = async (req: Request, res: Response) => {
  const { idAluno, idAtividade, valor } = req.body;

  if (!idAluno || !idAtividade || valor === undefined || valor === null) {
    return res.status(400).json({ error: 'Campos idAluno, idAtividade e valor são obrigatórios' });
  }

  try {
    const sql = 'INSERT INTO Nota (Id_Aluno, Id_Atividade, Valor) VALUES (?, ?, ?)';
    const [result] = await pool.promise().query<ResultSetHeader>(sql, [idAluno, idAtividade, valor]);
    res.status(201).json({ message: 'Nota criada com sucesso', insertId: result.insertId });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ error: 'Erro ao criar nota' });
  }
};

export const atualizarNota = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { valor } = req.body;

  if (valor === undefined || valor === null) {
    return res.status(400).json({ error: 'Campo valor é obrigatório' });
  }

  try {
    const sql = 'UPDATE Nota SET Valor = ? WHERE Id = ?';
    const [result] = await pool.promise().query<ResultSetHeader>(sql, [valor, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }
    res.json({ message: 'Nota atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ error: 'Erro ao atualizar nota' });
  }
};

export const deletarNota = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await pool.promise().query<ResultSetHeader>('DELETE FROM Nota WHERE Id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }
    res.json({ message: 'Nota deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    res.status(500).json({ error: 'Erro ao deletar nota' });
  }
};
