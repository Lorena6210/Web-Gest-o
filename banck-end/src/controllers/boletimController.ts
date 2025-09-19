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

// Função para calcular médias somando todas as notas e dividindo pela quantidade total
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

// Função para calcular frequência de faltas
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

// Função ÚNICA para atualizar boletim
async function atualizarBoletim(idAluno: number, idDisciplina: number, idBimestre: number) {
  const { mediaFinal } = await calcularMedias(idAluno, idDisciplina, idBimestre);
  const { frequencia } = await calcularFrequencia(idAluno, idDisciplina, idBimestre);

  let situacaoFinal: Boletim['Situacao'];
  if (mediaFinal >= 7) situacaoFinal = 'Aprovado';
  else if (mediaFinal >= 5) situacaoFinal = 'Recuperacao';
  else situacaoFinal = 'Reprovado';

  const sql = `
    INSERT INTO Boletim (Id_Aluno, Id_Disciplina, Id_Bimestre, MediaFinal, Situacao, Frequencia)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      MediaFinal = VALUES(MediaFinal),
      Situacao = VALUES(Situacao),
      Frequencia = VALUES(Frequencia)
  `;

  await pool.promise().query<ResultSetHeader>(sql, [
    idAluno,
    idDisciplina,
    idBimestre,
    mediaFinal,
    situacaoFinal,
    frequencia
  ]);
}

export { atualizarBoletim };


// Criar ou atualizar nota de Atividade
export const criarOuAtualizarNotaAtividade = async (req: Request, res: Response) => {
  const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor } = req.body;

  if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Atividade || Valor === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor' });
  }

  try {
    // Verificar se já existe nota para esse aluno e atividade
    const [rows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Atividade = ?
    `, [Id_Aluno, Id_Atividade]);

    if (rows.length > 0) {
      // Atualizar nota existente
      await pool.promise().query(`
        UPDATE Nota SET Valor = ? WHERE Id = ?
      `, [Valor, rows[0].Id]);
    } else {
      // Inserir nova nota
      await pool.promise().query(`
        INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor)
        VALUES (?, ?, ?, ?, ?)
      `, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor]);
    }

    // Atualizar boletim
    // Para pegar Id_Disciplina do Atividade:
    const [atividadeRows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id_Disciplina FROM Atividade WHERE Id = ?
    `, [Id_Atividade]);

    if (atividadeRows.length === 0) {
      return res.status(400).json({ error: 'Atividade não encontrada' });
    }

    const idDisciplina = atividadeRows[0].Id_Disciplina;

    await atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);

    res.json({ message: 'Nota de atividade criada/atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar/atualizar nota de atividade' });
  }
};

// Criar ou atualizar nota de Prova
export const criarOuAtualizarNotaProva = async (req: Request, res: Response) => {
  const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor } = req.body;

  if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Prova || Valor === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor' });
  }

  try {
    // Verificar se já existe nota para esse aluno e prova
    const [rows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Prova = ?
    `, [Id_Aluno, Id_Prova]);

    if (rows.length > 0) {
      // Atualizar nota existente
      await pool.promise().query(`
        UPDATE Nota SET Valor = ? WHERE Id = ?
      `, [Valor, rows[0].Id]);
    } else {
      // Inserir nova nota
      await pool.promise().query(`
        INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor)
        VALUES (?, ?, ?, ?, ?)
      `, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor]);
    }

    // Atualizar boletim
    // Para pegar Id_Disciplina do Prova:
    const [provaRows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id_Disciplina FROM Prova WHERE Id = ?
    `, [Id_Prova]);

    if (provaRows.length === 0) {
      return res.status(400).json({ error: 'Prova não encontrada' });
    }

    const idDisciplina = provaRows[0].Id_Disciplina;

    await atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);

    res.json({ message: 'Nota de prova criada/atualizada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar/atualizar nota de prova' });
  }
};

export const getNotasPorAlunoDisciplinaBimestre = async (req: Request, res: Response) => {
  const { idAluno, idDisciplina, idBimestre } = req.params;

  if (!idAluno || !idDisciplina || !idBimestre) {
    return res.status(400).json({ error: 'Parâmetros idAluno, idDisciplina e idBimestre são obrigatórios' });
  }

  try {
    // Notas Atividades
    const sqlAtividades = `
      SELECT n.Id, n.Valor, a.Titulo, a.DataEntrega
      FROM Nota n
      JOIN Atividade a ON n.Id_Atividade = a.Id
      WHERE n.Id_Aluno = ? AND a.Id_Disciplina = ? AND a.Id_Bimestre = ?
    `;
    const [notasAtividades] = await pool.promise().query<RowDataPacket[]>(sqlAtividades, [idAluno, idDisciplina, idBimestre]);

    // Notas Provas
    const sqlProvas = `
      SELECT n.Id, n.Valor, p.Titulo, p.DataEntrega
      FROM Nota n
      JOIN Prova p ON n.Id_Prova = p.Id
      WHERE n.Id_Aluno = ? AND p.Id_Disciplina = ? AND p.Id_Bimestre = ?
    `;
    const [notasProvas] = await pool.promise().query<RowDataPacket[]>(sqlProvas, [idAluno, idDisciplina, idBimestre]);

    res.json({
      notasAtividades,
      notasProvas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar notas detalhadas' });
  }
};

// GET - Todos os boletins com média final simples calculada + frequência
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
        -- Média simples das notas de Atividades
        IFNULL((
          SELECT AVG(n.Valor)
          FROM Nota n
          JOIN Atividade a ON n.Id_Atividade = a.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND a.Id_Disciplina = b.Id_Disciplina
            AND a.Id_Bimestre = b.Id_Bimestre
        ), 0) AS MediaAtividades,
        -- Média simples das notas de Provas
        IFNULL((
          SELECT AVG(n.Valor)
          FROM Nota n
          JOIN Prova p ON n.Id_Prova = p.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND p.Id_Disciplina = b.Id_Disciplina
            AND p.Id_Bimestre = b.Id_Bimestre
        ), 0) AS MediaProvas,
        -- Média final simples (média aritmética das duas médias)
        ROUND(
          (
            IFNULL((
              SELECT AVG(n.Valor)
              FROM Nota n
              JOIN Atividade a ON n.Id_Atividade = a.Id
              WHERE n.Id_Aluno = b.Id_Aluno
                AND a.Id_Disciplina = b.Id_Disciplina
                AND a.Id_Bimestre = b.Id_Bimestre
            ), 0)
            +
            IFNULL((
              SELECT AVG(n.Valor)
              FROM Nota n
              JOIN Prova p ON n.Id_Prova = p.Id
              WHERE n.Id_Aluno = b.Id_Aluno
                AND p.Id_Disciplina = b.Id_Disciplina
                AND p.Id_Bimestre = b.Id_Bimestre
            ), 0)
          ) / 2, 2
        ) AS MediaFinalCalculada
      FROM Boletim b
      ORDER BY b.Id_Aluno, b.Id_Bimestre, b.Id_Disciplina
    `;

    const [rows] = await pool.promise().query<RowDataPacket[]>(sql);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar boletins' });
  }
};


// POST - Criar ou atualizar boletim com média final simples calculada
export const createOrUpdateBoletim = async (req: Request, res: Response): Promise<void> => {
  const {
    Id_Aluno,
    Id_Disciplina,
    Id_Bimestre,
    Situacao = null,
    Observacoes = null
  } = req.body as Boletim;

  if (!Id_Aluno || !Id_Disciplina || !Id_Bimestre) {
    res.status(400).json({ error: 'Id_Aluno, Id_Disciplina e Id_Bimestre são obrigatórios' });
    return;
  }

  try {
    // Média das notas de Atividades
    const [mediaAtividadesRows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT AVG(n.Valor) AS MediaAtividades
      FROM Nota n
      JOIN Atividade a ON n.Id_Atividade = a.Id
      WHERE n.Id_Aluno = ? AND a.Id_Disciplina = ? AND a.Id_Bimestre = ?
    `, [Id_Aluno, Id_Disciplina, Id_Bimestre]);

    // Média das notas de Provas
    const [mediaProvasRows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT AVG(n.Valor) AS MediaProvas
      FROM Nota n
      JOIN Prova p ON n.Id_Prova = p.Id
      WHERE n.Id_Aluno = ? AND p.Id_Disciplina = ? AND p.Id_Bimestre = ?
    `, [Id_Aluno, Id_Disciplina, Id_Bimestre]);

    const mediaAtividades = mediaAtividadesRows[0]?.MediaAtividades ?? 0;
    const mediaProvas = mediaProvasRows[0]?.MediaProvas ?? 0;

    // Média final simples (média aritmética)
    const MediaFinal = Number(((mediaAtividades + mediaProvas) / 2).toFixed(2));

    // Definir situação se não fornecida
    let situacaoFinal = Situacao;
    if (!Situacao) {
      if (MediaFinal >= 7) situacaoFinal = 'Aprovado';
      else if (MediaFinal >= 5) situacaoFinal = 'Recuperacao';
      else situacaoFinal = 'Reprovado';
    }

    const sql = `
      INSERT INTO Boletim (Id_Aluno, Id_Disciplina, Id_Bimestre, MediaFinal, Situacao, Observacoes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        MediaFinal = VALUES(MediaFinal),
        Situacao = VALUES(Situacao),
        Observacoes = VALUES(Observacoes)
    `;

    const [result] = await pool.promise().query<ResultSetHeader>(sql, [
      Id_Aluno,
      Id_Disciplina,
      Id_Bimestre,
      MediaFinal,
      situacaoFinal,
      Observacoes
    ]);

    res.status(201).json({
      message: 'Boletim inserido/atualizado com sucesso',
      MediaFinal,
      Situacao: situacaoFinal,
      insertId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao inserir boletim' });
  }
};

// GET - Boletim por aluno com média final simples calculada
export const getBoletimPorAluno = async (req: Request, res: Response): Promise<void> => {
  const { idAluno } = req.params;

  if (!idAluno) {
    res.status(400).json({ error: 'Parâmetro idAluno é obrigatório' });
    return;
  }

  try {
    const sql = `
      SELECT
        b.Id_Aluno,
        b.Id_Disciplina,
        b.Id_Bimestre,
        IFNULL((
          SELECT AVG(n.Valor)
          FROM Nota n
          JOIN Atividade a ON n.Id_Atividade = a.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND a.Id_Disciplina = b.Id_Disciplina
            AND a.Id_Bimestre = b.Id_Bimestre
        ), 0) AS MediaAtividades,
        IFNULL((
          SELECT AVG(n.Valor)
          FROM Nota n
          JOIN Prova p ON n.Id_Prova = p.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND p.Id_Disciplina = b.Id_Disciplina
            AND p.Id_Bimestre = b.Id_Bimestre
        ), 0) AS MediaProvas,
        ROUND(
          (
            IFNULL((
              SELECT AVG(n.Valor)
              FROM Nota n
              JOIN Atividade a ON n.Id_Atividade = a.Id
              WHERE n.Id_Aluno = b.Id_Aluno
                AND a.Id_Disciplina = b.Id_Disciplina
                AND a.Id_Bimestre = b.Id_Bimestre
            ), 0)
            +
            IFNULL((
              SELECT AVG(n.Valor)
              FROM Nota n
              JOIN Prova p ON n.Id_Prova = p.Id
              WHERE n.Id_Aluno = b.Id_Aluno
                AND p.Id_Disciplina = b.Id_Disciplina
                AND p.Id_Bimestre = b.Id_Bimestre
            ), 0)
          ) / 2, 2
        ) AS MediaFinalCalculada,
        b.Situacao,
        b.Observacoes
      FROM Boletim b
      WHERE b.Id_Aluno = ?
      ORDER BY b.Id_Bimestre, b.Id_Disciplina
    `;

    const [rows] = await pool.promise().query<RowDataPacket[]>(sql, [idAluno]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar boletim do aluno' });
  }
};
