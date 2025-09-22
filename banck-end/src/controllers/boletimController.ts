import { Request, Response } from 'express';
import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Boletim {
  Id_Aluno: number;
  Id_Disciplina: number;
  Id_Bimestre: number;
  MediaFinal?: number | null;
  Situacao?: 'Aprovado' | 'Reprovado' | 'Recuperacao' | null;
  Observacoes?: string | null;
  Frequencia?: number | null;
}

// Função para calcular médias somando todas as notas e dividindo pela quantidade total (por bimestre)
async function calcularMedias(idAluno: number, idDisciplina: number, idBimestre: number) {
  const [somaAtividadesRows] = await pool.promise().query<RowDataPacket[]>(`
    SELECT IFNULL(SUM(n.Valor), 0) AS soma, COUNT(n.Valor) AS quantidade
    FROM Nota n
    JOIN Atividade a ON n.Id_Atividade = a.Id
    WHERE n.Id_Aluno = ? AND a.Id_Disciplina = ? AND a.Id_Bimestre = ?
  `, [idAluno, idDisciplina, idBimestre]);

  const [somaProvasRows] = await pool.promise().query<RowDataPacket[]>(`
    SELECT IFNULL(SUM(n.Valor), 0) AS soma, COUNT(n.Valor) AS quantidade
    FROM Nota n
    JOIN Prova p ON n.Id_Prova = p.Id
    WHERE n.Id_Aluno = ? AND p.Id_Disciplina = ? AND p.Id_Bimestre = ?
  `, [idAluno, idDisciplina, idBimestre]);

  const somaAtividades = somaAtividadesRows[0]?.soma ?? 0;
  const qtdAtividades = somaAtividadesRows[0]?.quantidade ?? 0;

  const somaProvas = somaProvasRows[0]?.soma ?? 0;
  const qtdProvas = somaProvasRows[0]?.quantidade ?? 0;

  const somaTotal = somaAtividades + somaProvas;
  const qtdTotal = qtdAtividades + qtdProvas;

  const mediaFinal = qtdTotal > 0 ? Number((somaTotal / qtdTotal).toFixed(2)) : 0;

  return { mediaFinal };
}

// Função para calcular frequência de faltas (por bimestre)
async function calcularFrequencia(idAluno: number, idDisciplina: number, idBimestre: number) {
  const [rows] = await pool.promise().query<RowDataPacket[]>(`
    SELECT COUNT(*) AS QtdeFaltas
    FROM Falta f
    JOIN Bimestre b ON f.DataFalta BETWEEN b.DataInicio AND b.DataFim
    WHERE f.Id_Aluno = ? AND f.Id_Disciplina = ? AND b.Id = ?
  `, [idAluno, idDisciplina, idBimestre]);

  const frequencia = rows[0]?.QtdeFaltas ?? 0;
  return { frequencia };
}

// Função ÚNICA para atualizar boletim (por bimestre, com observações opcionais)
async function atualizarBoletim(idAluno: number, idDisciplina: number, idBimestre: number, observacoes?: string) {
  const { mediaFinal } = await calcularMedias(idAluno, idDisciplina, idBimestre);
  const { frequencia } = await calcularFrequencia(idAluno, idDisciplina, idBimestre);

  let situacaoFinal: Boletim['Situacao'];
  if (mediaFinal >= 7) situacaoFinal = 'Aprovado';
  else if (mediaFinal >= 5) situacaoFinal = 'Recuperacao';
  else situacaoFinal = 'Reprovado';

  const sql = `
    INSERT INTO Boletim (Id_Aluno, Id_Disciplina, Id_Bimestre, MediaFinal, Situacao, Frequencia, Observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      MediaFinal = VALUES(MediaFinal),
      Situacao = VALUES(Situacao),
      Frequencia = VALUES(Frequencia),
      Observacoes = VALUES(Observacoes)
  `;

  await pool.promise().query<ResultSetHeader>(sql, [
    idAluno,
    idDisciplina,
    idBimestre,
    mediaFinal,
    situacaoFinal,
    frequencia,
    observacoes || null
  ]);
}

export { atualizarBoletim };

// POST - Criar ou atualizar nota de Atividade (com bimestre obrigatório)
export const criarOuAtualizarNotaAtividade = async (req: Request, res: Response) => {
  const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor } = req.body;

  if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Atividade || Valor === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor' });
  }

  try {
    // Verificar se já existe nota para esse aluno e atividade (por bimestre implícito via Nota)
    const [rows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Atividade = ? AND Id_Bimestre = ?
    `, [Id_Aluno, Id_Atividade, Id_Bimestre]);

    if (rows.length > 0) {
      // Atualizar nota existente
      await pool.promise().query<ResultSetHeader>(`
        UPDATE Nota SET Valor = ? WHERE Id = ?
      `, [Valor, rows[0].Id]);
    } else {
      // Inserir nova nota (com bimestre)
      await pool.promise().query<ResultSetHeader>(`
        INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor)
        VALUES (?, ?, ?, ?, ?)
      `, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor]);
    }

    // Pegar Id_Disciplina da Atividade (com verificação de bimestre)
    const [atividadeRows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id_Disciplina FROM Atividade WHERE Id = ? AND Id_Bimestre = ?
    `, [Id_Atividade, Id_Bimestre]);

    if (atividadeRows.length === 0) {
      return res.status(400).json({ error: 'Atividade não encontrada para o bimestre informado' });
    }

    const idDisciplina = atividadeRows[0].Id_Disciplina;

    // Atualizar boletim (por bimestre)
    await atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);

    res.json({ message: 'Nota de atividade criada/atualizada com sucesso (boletim atualizado por bimestre)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar/atualizar nota de atividade' });
  }
};

// POST - Criar ou atualizar nota de Prova (com bimestre obrigatório)
export const criarOuAtualizarNotaProva = async (req: Request, res: Response) => {
  const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor } = req.body;

  if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Prova || Valor === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor' });
  }

  try {
    // Verificar se já existe nota para esse aluno e prova (por bimestre)
    const [rows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Prova = ? AND Id_Bimestre = ?
    `, [Id_Aluno, Id_Prova, Id_Bimestre]);

    if (rows.length > 0) {
      // Atualizar nota existente
      await pool.promise().query<ResultSetHeader>(`
        UPDATE Nota SET Valor = ? WHERE Id = ?
      `, [Valor, rows[0].Id]);
    } else {
      // Inserir nova nota (com bimestre)
      await pool.promise().query<ResultSetHeader>(`
        INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor)
        VALUES (?, ?, ?, ?, ?)
      `, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor]);
    }

    // Pegar Id_Disciplina da Prova (com verificação de bimestre)
    const [provaRows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id_Disciplina FROM Prova WHERE Id = ? AND Id_Bimestre = ?
    `, [Id_Prova, Id_Bimestre]);

    if (provaRows.length === 0) {
      return res.status(400).json({ error: 'Prova não encontrada para o bimestre informado' });
    }

    const idDisciplina = provaRows[0].Id_Disciplina;

    // Atualizar boletim (por bimestre)
    await atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);

    res.json({ message: 'Nota de prova criada/atualizada com sucesso (boletim atualizado por bimestre)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar/atualizar nota de prova' });
  }
};

// GET - Notas por aluno, disciplina e bimestre (detalhado)
export const getNotasPorAlunoDisciplinaBimestre = async (req: Request, res: Response) => {
  const { idAluno, idDisciplina, idBimestre } = req.params;

  if (!idAluno || !idDisciplina || !idBimestre) {
    return res.status(400).json({ error: 'Parâmetros idAluno, idDisciplina e idBimestre são obrigatórios' });
  }

  try {
    // Notas de Atividades (filtrado por bimestre)
    const sqlAtividades = `
      SELECT n.Id, n.Valor, a.Titulo, a.DataEntrega
      FROM Nota n
      JOIN Atividade a ON n.Id_Atividade = a.Id
      WHERE n.Id_Aluno = ? AND a.Id_Disciplina = ? AND a.Id_Bimestre = ?
      ORDER BY a.DataEntrega
    `;
    const [notasAtividades] = await pool.promise().query<RowDataPacket[]>(sqlAtividades, [idAluno, idDisciplina, idBimestre]);

    // Notas de Provas (filtrado por bimestre)
    const sqlProvas = `
      SELECT n.Id, n.Valor, p.Titulo, p.DataEntrega
      FROM Nota n
      JOIN Prova p ON n.Id_Prova = p.Id
      WHERE n.Id_Aluno = ? AND p.Id_Disciplina = ? AND p.Id_Bimestre = ?
      ORDER BY p.DataEntrega
    `;
    const [notasProvas] = await pool.promise().query<RowDataPacket[]>(sqlProvas, [idAluno, idDisciplina, idBimestre]);

    res.json({
      idBimestre: Number(idBimestre), // Retorna o bimestre usado
      notasAtividades,
      notasProvas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar notas detalhadas por bimestre' });
  }
};

// GET - Todos os boletins (com cálculos por bimestre)
export const getBoletins = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sql = `
      SELECT
        b.Id_Aluno,
        b.Id_Disciplina,
        b.Id_Bimestre,
        b.Situacao,
        b.Observacoes,
        b.Frequencia,
        -- Média simples das notas de Atividades (por bimestre)
        IFNULL((
          SELECT AVG(n.Valor)
          FROM Nota n
          JOIN Atividade a ON n.Id_Atividade = a.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND a.Id_Disciplina = b.Id_Disciplina
            AND a.Id_Bimestre = b.Id_Bimestre
        ), 0) AS MediaAtividades,
        -- Média simples das notas de Provas (por bimestre)
        IFNULL((
          SELECT AVG(n.Valor)
          FROM Nota n
          JOIN Prova p ON n.Id_Prova = p.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND p.Id_Disciplina = b.Id_Disciplina
            AND p.Id_Bimestre = b.Id_Bimestre
        ), 0) AS MediaProvas,
        -- Média final ponderada (70% Provas, 30% Atividades)
        ROUND(
          IFNULL((
            SELECT AVG(n.Valor)
            FROM Nota n
            JOIN Atividade a ON n.Id_Atividade = a.Id
            WHERE n.Id_Aluno = b.Id_Aluno
              AND a.Id_Disciplina = b.Id_Disciplina
              AND a.Id_Bimestre = b.Id_Bimestre
          ), 0) * 0.3 +
          IFNULL((
            SELECT AVG(n.Valor)
            FROM Nota n
            JOIN Prova p ON n.Id_Prova = p.Id
            WHERE n.Id_Aluno = b.Id_Aluno
              AND p.Id_Disciplina = b.Id_Disciplina
              AND p.Id_Bimestre = b.Id_Bimestre
          ), 0) * 0.7,
          2
        ) AS MediaFinal
      FROM Boletim b
      ORDER BY b.Id_Aluno, b.Id_Disciplina, b.Id_Bimestre
    `;
    const [results] = await pool.promise().query<RowDataPacket[]>(sql);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar boletins' });
  }
};

// GET - Boletim específico por aluno e disciplina (com cálculos por bimestre)
export const getBoletimPorAlunoEDisciplina = async (req: Request, res: Response): Promise<void> => {
  const { idAluno, idDisciplina } = req.params;

  if (!idAluno || !idDisciplina) {
    res.status(400).json({ error: 'Parâmetros idAluno e idDisciplina são obrigatórios' });
    return;
  }
  
  try {
    const sql = `
      SELECT
        b.Id_Aluno,
        b.Id_Disciplina,
        b.Id_Bimestre,
        b.Situacao,
        b.Observacoes,
        b.Frequencia,
        -- Média simples das notas de Atividades (por bimestre)
        IFNULL((
          SELECT AVG(n.Valor)
          FROM Nota n
          JOIN Atividade a ON n.Id_Atividade = a.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND a.Id_Disciplina = b.Id_Disciplina
            AND a.Id_Bimestre = b.Id_Bimestre
        ), 0) AS MediaAtividades,
        -- Média simples das notas de Provas (por bimestre)
        IFNULL((
          SELECT AVG(n.Valor)
          FROM Nota n
          JOIN Prova p ON n.Id_Prova = p.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND p.Id_Disciplina = b.Id_Disciplina
            AND p.Id_Bimestre = b.Id_Bimestre
        ), 0) AS MediaProvas,
        -- Média final ponderada (70% Provas, 30% Atividades)
        ROUND(
          IFNULL((
            SELECT AVG(n.Valor)
            FROM Nota n
            JOIN Atividade a ON n.Id_Atividade = a.Id
            WHERE n.Id_Aluno = b.Id_Aluno
              AND a.Id_Disciplina = b.Id_Disciplina
              AND a.Id_Bimestre = b.Id_Bimestre
          ), 0) * 0.3 +
          IFNULL((
            SELECT AVG(n.Valor)
            FROM Nota n
            JOIN Prova p ON n.Id_Prova = p.Id
            WHERE n.Id_Aluno = b.Id_Aluno
              AND p.Id_Disciplina = b.Id_Disciplina
              AND p.Id_Bimestre = b.Id_Bimestre
          ), 0) * 0.7,
          2
        ) AS MediaFinal
      FROM Boletim b
      WHERE b.Id_Aluno = ? AND b.Id_Disciplina = ?
      ORDER BY b.Id_Bimestre
    `;
    const [results] = await pool.promise().query<RowDataPacket[]>(sql, [idAluno, idDisciplina]);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar boletim por aluno e disciplina' });
  }
}