import { Request, Response } from 'express';
import pool from '../db';
import { OkPacket, RowDataPacket } from 'mysql2';

export interface CustomRequest extends Request {
  userId: number[];
}

export const obterAtividades = async (_req: Request, res: Response) => {
  const sql = `
    SELECT 
      a.Id AS id,
      a.Titulo AS titulo,
      a.Descricao AS descricao,
      a.DataCriacao AS dataCriacao,
      a.DataEntrega AS dataEntrega,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Atividade a
    JOIN Professor p ON a.Id_Professor = p.Id
    JOIN Turma t ON a.Id_Turma = t.Id
    JOIN Disciplina d ON a.Id_Disciplina = d.Id
  `;

  try {
    const [results] = await pool.promise().query<RowDataPacket[]>(sql);
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar atividades:', err);
    res.status(500).json({ error: 'Erro ao buscar atividades' });
  }
};

export const criarAtividade = async (req: Request, res: Response) => {
  const { Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioAtividade, Id_Bimestre } = req.body;

  if (!Titulo || !DataCriacao || !DataEntrega || !Id_Professor || !Id_Turma || !Id_Disciplina) {
    return res.status(400).json({ error: 'Campos obrigatórios: Titulo, DataCriacao, Id_Professor, Id_Turma, Id_Disciplina' });
  }

  const sql = `
    INSERT INTO Atividade 
      (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioAtividade, Id_Bimestre)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.promise().query<OkPacket>(sql, [
      Titulo,
      Descricao ,
      DataCriacao,
      DataEntrega,
      Id_Professor,
      Id_Turma,
      Id_Disciplina,
      EnvioAtividade,
      Id_Bimestre
    ]);
    res.status(201).json({ message: 'Atividade criada com sucesso', id: result.insertId });
  } catch (err) {
    console.error('Erro ao criar atividade:', err);
    res.status(500).json({ error: 'Erro ao criar atividade' });
  }
};
// Criar nota para uma atividade
export const criarNotaAtividade = async (req: Request, res: Response) => {
  const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor } = req.body;

  if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Atividade || Valor === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor' });
  }

  const sql = `
    INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.promise().query<OkPacket>(sql, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor]);
    res.status(201).json({ message: 'Nota criada com sucesso', id: result.insertId });
  } catch (err) {
    console.error('Erro ao criar nota:', err);
    res.status(500).json({ error: 'Erro ao criar nota' });
  }
};

// Obter todas as notas de uma atividade
export const obterNotasAtividade = async (req: Request, res: Response) => {
  const { atividadeId } = req.params;

  const sql = `
    SELECT n.Id, n.Id_Aluno, a.Nome AS NomeAluno, n.Id_Turma, n.Id_Bimestre, n.Valor
    FROM Nota n
    JOIN Aluno a ON n.Id_Aluno = a.Id
    WHERE n.Id_Atividade = ?
  `;

  try {
    const [results] = await pool.promise().query<RowDataPacket[]>(sql, [atividadeId]);
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar notas:', err);
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
};


export const atualizarAtividade = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Titulo, Descricao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina } = req.body;

  if (!Titulo || !Id_Professor || !Id_Turma || !Id_Disciplina) {
    return res.status(400).json({ error: 'Campos obrigatórios: Titulo, Id_Professor, Id_Turma, Id_Disciplina' });
  }

  const sql = `
    UPDATE Atividade
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
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    res.json({ message: 'Atividade atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar atividade:', err);
    res.status(500).json({ error: 'Erro ao atualizar atividade' });
  }
};

export const deletarAtividade = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await pool.promise().query<OkPacket>('DELETE FROM Atividade WHERE Id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    res.json({ message: 'Atividade deletada com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar atividade:', err);
    res.status(500).json({ error: 'Erro ao deletar atividade' });
  }
};


export const atutalizarAtividade = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Titulo, Descricao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina } = req.body;

  if (!Titulo || !Id_Professor || !Id_Turma || !Id_Disciplina) {
    return res.status(400).json({ error: 'Campos obrigatórios: Titulo, Id_Professor, Id_Turma, Id_Disciplina' });
  }

  const sql = `
    UPDATE Atividade
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
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    res.json({ message: 'Atividade atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar atividade:', err);
    res.status(500).json({ error: 'Erro ao atualizar atividade' });
  }
};
