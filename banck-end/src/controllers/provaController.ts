import { Request, Response } from 'express';
import pool from '../db';
import { OkPacket, RowDataPacket } from 'mysql2';
import { atualizarBoletim } from './boletimController'; // Ajuste o caminho conforme sua estrutura (importe do módulo de boletim)

// GET - Obter notas de uma prova específica (com filtro por bimestre opcional via ?bimestre=1)
export const obterNotasProva = async (req: Request, res: Response) => {
  const { provaId } = req.params;
  const idBimestre = req.query.bimestre ? Number(req.query.bimestre) : null;

  let sql = `
    SELECT 
      n.Id, n.Id_Aluno, a.Nome AS NomeAluno, n.Id_Turma, n.Id_Bimestre, n.Valor, 
      b.Nome AS NomeBimestre,
      p.Id AS IdProva, p.Titulo AS TituloProva, p.Id_Professor, prof.Nome AS NomeProfessor,
      p.Id_Disciplina, d.Nome AS NomeDisciplina, p.Id_Turma AS ProvaIdTurma, t.Nome AS NomeTurma,
      p.Id_Bimestre AS ProvaIdBimestre
    FROM Nota n
    JOIN Aluno a ON n.Id_Aluno = a.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Prova p ON n.Id_Prova = p.Id
    LEFT JOIN Professor prof ON p.Id_Professor = prof.Id
    LEFT JOIN Disciplina d ON p.Id_Disciplina = d.Id
    LEFT JOIN Turma t ON p.Id_Turma = t.Id
    WHERE n.Id_Prova = ?
  `;

  const params: (number | string)[] = [Number(provaId)];
  if (idBimestre) {
    sql += ` AND n.Id_Bimestre = ?`;
    params.push(idBimestre);
  }

  sql += ` ORDER BY n.Id_Bimestre, a.Nome`;

  try {
    const [results] = await pool.promise().query<RowDataPacket[]>(sql, params);
    res.json({
      notas: results,
      filtroBimestre: idBimestre || 'Todos os bimestres',
      totalNotas: results.length
    });
  } catch (err) {
    console.error('Erro ao buscar notas de prova:', err);
    res.status(500).json({ error: 'Erro ao buscar notas de prova' });
  }
};


// POST - Criar prova (Id_Bimestre obrigatório)
export const criarProva = async (req: Request, res: Response) => {
  const { Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioProva, Id_Bimestre } = req.body;

  if (!Titulo || !DataCriacao || !Id_Professor || !Id_Turma || !Id_Disciplina || !Id_Bimestre) {
    return res.status(400).json({ error: 'Campos obrigatórios: Titulo, DataCriacao, Id_Professor, Id_Turma, Id_Disciplina, Id_Bimestre' });
  }

  try {
    // Verificar se o bimestre existe
    const [bimestreRows] = await pool.promise().query<RowDataPacket[]>(`SELECT Id FROM Bimestre WHERE Id = ?`, [Id_Bimestre]);
    if (bimestreRows.length === 0) {
      return res.status(400).json({ error: 'Bimestre não encontrado' });
    }

    const sql = `
      INSERT INTO Prova 
        (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioProva, Id_Bimestre)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.promise().query<OkPacket>(sql, [
      Titulo,
      Descricao || null,
      DataCriacao,
      DataEntrega || null,
      Id_Professor,
      Id_Turma,
      Id_Disciplina,
      EnvioProva || null,
      Id_Bimestre
    ]);

    res.status(201).json({ message: 'Prova criada com sucesso no bimestre informado', id: result.insertId, idBimestre: Id_Bimestre });
  } catch (err) {
    console.error('Erro ao criar prova:', err);
    res.status(500).json({ error: 'Erro ao criar prova' });
  }
};

// POST - Criar nota para uma prova (com verificação de bimestre)
export const criarNotaProva = async (req: Request, res: Response) => {
  const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor } = req.body;

  if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Prova || Valor === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor' });
  }

  try {
    // Verificar se a prova pertence ao bimestre informado
    const [provaRows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id_Disciplina FROM Prova WHERE Id = ? AND Id_Bimestre = ?
    `, [Id_Prova, Id_Bimestre]);

    if (provaRows.length === 0) {
      return res.status(400).json({ error: 'Prova não encontrada para o bimestre informado' });
    }

    const idDisciplina = provaRows[0].Id_Disciplina;

    // Inserir nota na tabela Nota vinculada à prova
    const sql = `
      INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.promise().query<OkPacket>(sql, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor]);

    // Atualizar boletim para refletir a nova nota
    await atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);

    res.status(201).json({ message: 'Nota de prova criada com sucesso no bimestre informado', id: result.insertId, idBimestre: Id_Bimestre });
  } catch (err) {
    console.error('Erro ao criar nota de prova:', err);
    res.status(500).json({ error: 'Erro ao criar nota de prova' });
  }
};


// PUT - Atualizar prova (suporte a Id_Bimestre opcional)
export const atualizarProva = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Titulo, Descricao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, Id_Bimestre } = req.body;

  if (!Titulo || !Id_Professor || !Id_Turma || !Id_Disciplina) {
    return res.status(400).json({ error: 'Campos obrigatórios: Titulo, Id_Professor, Id_Turma, Id_Disciplina' });
  }

  // Se Id_Bimestre fornecido, validar existência
  if (Id_Bimestre) {
    const [bimestreRows] = await pool.promise().query<RowDataPacket[]>(`SELECT Id FROM Bimestre WHERE Id = ?`, [Id_Bimestre]);
    if (bimestreRows.length === 0) {
      return res.status(400).json({ error: 'Bimestre não encontrado' });
    }
  }

  let sql = `
    UPDATE Prova
    SET Titulo = ?, Descricao = ?, DataEntrega = ?, Id_Professor = ?, Id_Turma = ?, Id_Disciplina = ?
  `;

const params: (string | number | null)[] = [
  Titulo,
  Descricao || null,
  DataEntrega || null,
  Id_Professor,
  Id_Turma,
  Id_Disciplina,
  id
];

  if (Id_Bimestre !== undefined) {
    sql += `, Id_Bimestre = ?`;
    params.splice(params.length - 1, 0, Id_Bimestre); // Inserir antes do WHERE
    params.push(id); // Adicionar id no final
  } else {
    params.push(id);
  }

  sql += ` WHERE Id = ?`;

  try {
    const [result] = await pool.promise().query<OkPacket>(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    res.json({ 
      message: 'Prova atualizada com sucesso', 
      idBimestreAtualizado: Id_Bimestre || 'Não alterado' 
    });
  } catch (err) {
    console.error('Erro ao atualizar prova:', err);
    res.status(500).json({ error: 'Erro ao atualizar prova' });
  }
};

// DELETE - Deletar prova (com filtro por bimestre opcional via ?bimestre=1)
export const deletarProva = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idBimestre = req.query.bimestre ? Number(req.query.bimestre) : null;

  let sql = `DELETE FROM Prova WHERE Id = ?`;
const params: (string | number | null)[] = [id];
  if (idBimestre) {
    sql += ` AND Id_Bimestre = ?`;
    params.push(idBimestre);
  }

  try {
    const [result] = await pool.promise().query<OkPacket>(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Prova não encontrada (verifique o bimestre)' });
    }
    res.json({ message: 'Prova deletada com sucesso', idBimestre: idBimestre || 'Todos' });
  } catch (err) {
    console.error('Erro ao deletar prova:', err);
    res.status(500).json({ error: 'Erro ao deletar prova' });
  }
};

// GET - Obter todas as provas (com filtros opcionais por turma e bimestre via ?turmaId=1&bimestre=1)
export const obterProvas = async (req: Request, res: Response) => {
  const turmaId = req.query.turmaId ? Number(req.query.turmaId) : null;
  const idBimestre = req.query.bimestre ? Number(req.query.bimestre) : null;

  let sql = `
    SELECT 
      pr.Id AS id,
      pr.Titulo AS titulo,
      pr.Descricao AS descricao,
      pr.DataCriacao AS dataCriacao,
      pr.DataEntrega AS dataEntrega,
      pr.Id_Bimestre AS idBimestre,
      b.Nome AS nomeBimestre,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Prova pr
    JOIN Professor p ON pr.Id_Professor = p.Id
    JOIN Turma t ON pr.Id_Turma = t.Id
    JOIN Disciplina d ON pr.Id_Disciplina = d.Id
    JOIN Bimestre b ON pr.Id_Bimestre = b.Id
  `;

const params: (string | number)[] = [];  const whereClauses: string[] = [];

  if (turmaId) {
    whereClauses.push(`pr.Id_Turma = ?`);
    params.push(turmaId);
  }

  if (idBimestre) {
    whereClauses.push(`pr.Id_Bimestre = ?`);
    params.push(idBimestre);
  }

  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  sql += ` ORDER BY pr.DataEntrega DESC`; // Ordenar por data de entrega

  try {
    const [results] = await pool.promise().query<RowDataPacket[]>(sql, params);
    res.json({
      provas: results,
      filtros: { turmaId: turmaId || 'Todas', bimestre: idBimestre || 'Todos' }
    });
  } catch (err) {
    console.error('Erro ao buscar provas:', err);
    res.status(500).json({ error: 'Erro ao buscar provas' });
  }
};

// GET - Obter provas por turma (com filtro por bimestre opcional via ?bimestre=1)
export const obterProvasPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params;
  const idBimestre = req.query.bimestre ? Number(req.query.bimestre) : null;

  let sql = `
    SELECT 
      pr.Id AS id,
      pr.Titulo AS titulo,
      pr.Descricao AS descricao,
      pr.DataCriacao AS dataCriacao,
      pr.DataEntrega AS dataEntrega,
      pr.Id_Bimestre AS idBimestre,
      b.Nome AS nomeBimestre,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Prova pr
    JOIN Professor p ON pr.Id_Professor = p.Id
    JOIN Turma t ON pr.Id_Turma = t.Id
    JOIN Disciplina d ON pr.Id_Disciplina = d.Id
    JOIN Bimestre b ON pr.Id_Bimestre = b.Id
    WHERE pr.Id_Turma = ?
  `;

const params: (number | string)[] = [turmaId];
  if (idBimestre) {
    sql += ` AND pr.Id_Bimestre = ?`;
    params.push(idBimestre);
  }

  sql += ` ORDER BY pr.DataEntrega DESC`; // Ordenar por data de entrega

  try {
    const [results] = await pool.promise().query<RowDataPacket[]>(sql, params);
    res.json({
      provas: results,
      turmaId: Number(turmaId),
      filtroBimestre: idBimestre || 'Todos os bimestres'
    });
  } catch (err) {
    console.error('Erro ao buscar provas por turma:', err);
    res.status(500).json({ error: 'Erro ao buscar provas por turma' });
  }
};
// GET - Obter provas por disciplina (com filtro por bimestre opcional via ?bimestre=1)
export const obterProvasPorDisciplina = async (req: Request, res: Response) => {
  const { disciplinaId } = req.params;
  const idBimestre = req.query.bimestre ? Number(req.query.bimestre) : null;

  let sql = `
    SELECT 
      pr.Id AS id,
      pr.Titulo AS titulo,
      pr.Descricao AS descricao,
      pr.DataCriacao AS dataCriacao,
      pr.DataEntrega AS dataEntrega,
      pr.Id_Bimestre AS idBimestre,
      b.Nome AS nomeBimestre,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Prova pr
    JOIN Professor p ON pr.Id_Professor = p.Id
    JOIN Turma t ON pr.Id_Turma = t.Id
    JOIN Disciplina d ON pr.Id_Disciplina = d.Id
    JOIN Bimestre b ON pr.Id_Bimestre = b.Id
    WHERE pr.Id_Disciplina = ?
  `;

  const params: (number | string | null)[] = [disciplinaId];
  if (idBimestre) {
    sql += ` AND pr.Id_Bimestre = ?`;
    params.push(idBimestre);
  }
  sql += ` ORDER BY pr.DataEntrega DESC`; // Ordenar por data de entrega
  
  try {
    const [results] = await pool.promise().query<RowDataPacket[]>(sql, params);
    res.json({
      provas: results,
      disciplinaId: Number(disciplinaId),
      filtroBimestre: idBimestre || 'Todos os bimestres'
    });
  } catch (err) {
    console.error('Erro ao buscar provas por disciplina:', err);
    res.status(500).json({ error: 'Erro ao buscar provas por disciplina' });
  }
}