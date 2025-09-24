import { Request, Response } from 'express';
import pool from '../db';
import { OkPacket, RowDataPacket } from 'mysql2';
import { atualizarBoletim } from './boletimController'; // Ajuste o caminho conforme sua estrutura

// Interfaces para tipagem segura (sem 'any')
interface NotaProva extends RowDataPacket {
  Id: number;
  Id_Aluno: number;
  nomeAluno: string;  // Nome do aluno (de JOIN com Aluno)
  Valor: number;
  Id_Bimestre: number;
  // Adicione outros campos se necessário (ex.: DataLancamento se existir na tabela Nota)
}

interface BoletimResumo extends RowDataPacket {
  Id_Aluno: number;
  nomeAluno: string;
  MediaFinal: number;
  Situacao: string;
  Observacoes: string | null;
  Frequencia: number;
}

interface FaltasResumo extends RowDataPacket {
  totalFaltas: number;
}

interface ProvaCompleta extends RowDataPacket {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataEntrega: string;
  idBimestre: number;
  nomeBimestre: string;
  dataInicioBimestre: string;
  dataFimBimestre: string;
  statusBimestre: string;
  professor: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    status: string;
    formacaoAcademica: string;
  };
  turma: {
    id: number;
    nome: string;
    serie: string;
    anoLetivo: number;
    turno: string;
    sala: string;
    capacidadeMaxima: number;
    status: string;
  };
  disciplina: {
    id: number;
    nome: string;
    codigo: string;
    ementa: string;
    cargaHoraria: number;
    preRequisitos: string;
  };
  notas: NotaProva[];  // Array tipado
  boletimResumo: BoletimResumo[];  // Array tipado
  faltasResumo: number;  // Número simples
}

// GET - Obter prova completa por ID (todas as informações relacionadas) - VERSÃO CORRIGIDA SEM 'ANY'
export const obterProvaCompleta = async (req: Request, res: Response) => {
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
      b.DataInicio AS dataInicioBimestre,
      b.DataFim AS dataFimBimestre,
      b.Status AS statusBimestre,
      -- Professor completo
      p.Id AS professor_id,
      p.Nome AS professor_nome,
      p.Email AS professor_email,
      p.Telefone AS professor_telefone,
      p.Status AS professor_status,
      p.FormacaoAcademica AS professor_formacao,
      -- Turma completa
      t.Id AS turma_id,
      t.Nome AS turma_nome,
      t.Serie AS turma_serie,
      t.AnoLetivo AS turma_anoLetivo,
      t.Turno AS turma_turno,
      t.Sala AS turma_sala,
      t.CapacidadeMaxima AS turma_capacidadeMaxima,
      t.Status AS turma_status,
      -- Disciplina completa
      d.Id AS disciplina_id,
      d.Nome AS disciplina_nome,
      d.Codigo AS disciplina_codigo,
      d.Ementa AS disciplina_ementa,
      d.CargaHoraria AS disciplina_cargaHoraria,
      d.PreRequisitos AS disciplina_preRequisitos
    FROM Prova pr
    JOIN Professor p ON pr.Id_Professor = p.Id
    JOIN Turma t ON pr.Id_Turma = t.Id
    JOIN Disciplina d ON pr.Id_Disciplina = d.Id
    JOIN Bimestre b ON pr.Id_Bimestre = b.Id
    WHERE pr.Id = ?
  `;

  const params: (number | string)[] = [];  // Tipado como array de number/string
  if (idBimestre) {
    sql += ` AND pr.Id_Bimestre = ?`;
    params.push(idBimestre);
  }

  try {
    // Query principal tipada (estende RowDataPacket para os campos customizados)
    const [provaRows] = await pool.promise().query<(ProvaCompleta & RowDataPacket)[]>(sql, params);
    if (provaRows.length === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    const provaBase = provaRows[0] as ProvaCompleta;  // Cast seguro para ProvaCompleta (sem campos aninhados ainda)

    // Buscar notas associadas (query tipada com interface NotaProva)
    const notasSql = `
      SELECT n.Id, n.Id_Aluno AS idAluno, a.Nome AS nomeAluno, n.Valor, n.Id_Bimestre
      FROM Nota n
      JOIN Aluno a ON n.Id_Aluno = a.Id
      WHERE n.Id_Prova = ? ${idBimestre ? 'AND n.Id_Bimestre = ?' : ''}
      ORDER BY a.Nome
    `;
    const notasParams: (number)[] = [];
    if (idBimestre) {
      notasParams.push(idBimestre);
    }
    const [notasRows] = await pool.promise().query<NotaProva[]>(notasSql, notasParams);

    // Buscar resumo de boletim (query tipada com interface BoletimResumo)
    const boletimSql = `
      SELECT bo.Id_Aluno, al.Nome AS nomeAluno, bo.MediaFinal, bo.Situacao, bo.Observacoes, bo.Frequencia
      FROM Boletim bo
      JOIN Aluno al ON bo.Id_Aluno = al.Id
      WHERE bo.Id_Disciplina = ? AND bo.Id_Bimestre = ? AND al.Id IN (
        SELECT Id_Aluno FROM Aluno_Turma WHERE Id_Turma = ?
      )
      ORDER BY al.Nome
    `;
    const [boletimRows] = await pool.promise().query<BoletimResumo[]>(boletimSql, [
      provaBase.disciplina_id,
      provaBase.idBimestre,
      provaBase.turma_id
    ]);

    // Buscar total de faltas (query tipada com interface FaltasResumo)
    const faltasSql = `
      SELECT COUNT(*) AS totalFaltas
      FROM Falta f
      JOIN Bimestre b ON f.DataFalta BETWEEN b.DataInicio AND b.DataFim
      WHERE f.Id_Turma = ? AND f.Id_Disciplina = ? AND b.Id = ?
    `;
    const [faltasRows] = await pool.promise().query<FaltasResumo[]>(faltasSql, [
      provaBase.turma_id,
      provaBase.disciplina_id,
      provaBase.idBimestre
    ]);
    const totalFaltas = faltasRows.length > 0 ? faltasRows[0].totalFaltas : 0;

    // Construir objeto completo com tipagem (sem 'any')
    const provaCompleta: ProvaCompleta = {
      ...provaBase,
      professor: {
        id: Number(provaBase.professor_id || 0),
        nome: String(provaBase.professor_nome || ''),
        email: String(provaBase.professor_email || ''),
        telefone: String(provaBase.professor_telefone || ''),
        status: String(provaBase.professor_status || ''),
        formacaoAcademica: String(provaBase.professor_formacao || ''),
      },
      turma: {
        id: Number(provaBase.turma_id || 0),
        nome: String(provaBase.turma_nome || ''),
        serie: String(provaBase.turma_serie || ''),
        anoLetivo: Number(provaBase.turma_anoLetivo || 0),
        turno: String(provaBase.turma_turno || ''),
        sala: String(provaBase.turma_sala || ''),
        capacidadeMaxima: Number(provaBase.turma_capacidadeMaxima || 0),
        status: String(provaBase.turma_status || ''),
      },
      disciplina: {
        id: Number(provaBase.disciplina_id || 0),
        nome: String(provaBase.disciplina_nome || ''),
        codigo: String(provaBase.disciplina_codigo || ''),
        ementa: String(provaBase.disciplina_ementa || ''),
        cargaHoraria: Number(provaBase.disciplina_cargaHoraria || 0),
        preRequisitos: String(provaBase.disciplina_preRequisitos || ''),
      },
      notas: notasRows,  // Já tipado como NotaProva[]
      boletimResumo: boletimRows,  // Já tipado como BoletimResumo[]
      faltasResumo: Number(totalFaltas),  // Cast para number (sem 'any')
    };

    res.json({
      prova: provaCompleta,
      filtroBimestre: idBimestre || 'Todos os bimestres',
      totalAlunosComNotas: provaCompleta.notas.length,
      totalFaltas: provaCompleta.faltasResumo,
    });
  } catch (err) {
    console.error('Erro ao buscar prova completa:', err);
    res.status(500).json({ error: 'Erro ao buscar prova completa' });
  }
};

// GET - Obter notas de uma prova específica (expandido com mais info do aluno e média)
export const obterNotasProva = async (req: Request, res: Response) => {
  const { provaId } = req.params;
  const idBimestre = req.query.bimestre ? Number(req.query.bimestre) : null;

  let sql = `
    SELECT 
      n.Id, n.Id_Aluno, a.Nome AS NomeAluno, a.Email AS EmailAluno, a.RA AS RAAluno,
      n.Id_Turma, n.Id_Bimestre, n.Valor, b.Nome AS NomeBimestre,
      -- Média da prova para este aluno (subquery simples)
      (SELECT AVG(n2.Valor) FROM Nota n2 WHERE n2.Id_Prova = n.Id_Prova AND n2.Id_Aluno = n.Id_Aluno) AS MediaAlunoProva
    FROM Nota n
    JOIN Aluno a ON n.Id_Aluno = a.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
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
      totalNotas: results.length,
    });
  } catch (err) {
    console.error('Erro ao buscar notas de prova:', err);
    res.status(500).json({ error: 'Erro ao buscar notas de prova' });
  }
};

// POST - Criar prova (mantido, mas com validação expandida para grade se aplicável)
export const criarProva = async (req: Request, res: Response) => {
  const { Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioProva, Id_Bimestre, Id_GradeDisciplina } = req.body;

  if (!Titulo || !DataCriacao || !Id_Professor || !Id_Turma || !Id_Disciplina || !Id_Bimestre) {
    return res.status(400).json({ error: 'Campos obrigatórios: Titulo, DataCriacao, Id_Professor, Id_Turma, Id_Disciplina, Id_Bimestre' });
  }

  try {
    // Verificar se o bimestre existe
    const [bimestreRows] = await pool.promise().query<RowDataPacket[]>(`SELECT Id FROM Bimestre WHERE Id = ?`, [Id_Bimestre]);
    if (bimestreRows.length === 0) {
      return res.status(400).json({ error: 'Bimestre não encontrado' });
    }

    // Verificar se Id_GradeDisciplina existe (se fornecido)
    if (Id_GradeDisciplina) {
      const [gradeRows] = await pool.promise().query<RowDataPacket[]>(`SELECT Id FROM GradeDisciplina WHERE Id = ?`, [Id_GradeDisciplina]);
      if (gradeRows.length === 0) {
        return res.status(400).json({ error: 'GradeDisciplina não encontrada' });
      }
    }

    const sql = `
      INSERT INTO Prova 
        (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioProva, Id_Bimestre, Id_GradeDisciplina)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      Id_Bimestre,
      Id_GradeDisciplina || null  // Opcional
    ]);

    res.status(201).json({ 
      message: 'Prova criada com sucesso no bimestre informado', 
      id: result.insertId, 
      idBimestre: Id_Bimestre,
      idGradeDisciplina: Id_GradeDisciplina || 'Não especificada'
    });
  } catch (err) {
    console.error('Erro ao criar prova:', err);
    res.status(500).json({ error: 'Erro ao criar prova' });
  }
};

// POST - Criar nota para uma prova (mantido, com chamada para boletim)
export const criarNotaProva = async (req: Request, res: Response) => {
  const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor } = req.body;

  if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Prova || Valor === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor' });
  }

  try {
    // Verificar se a prova pertence ao bimestre
    const [provaRows] = await pool.promise().query<RowDataPacket[]>(`
      SELECT Id_Disciplina FROM Prova WHERE Id = ? AND Id_Bimestre = ?
    `, [Id_Prova, Id_Bimestre]);

    if (provaRows.length === 0) {
      return res.status(400).json({ error: 'Prova não encontrada para o bimestre informado' });
    }

    const idDisciplina = provaRows[0].Id_Disciplina;

    const sql = `
      INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.promise().query<OkPacket>(sql, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor]);

    // Atualizar boletim por bimestre
    await atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);

    res.status(201).json({ 
      message: 'Nota de prova criada com sucesso no bimestre informado', 
      id: result.insertId, 
      idBimestre: Id_Bimestre 
    });
  } catch (err) {
    console.error('Erro ao criar nota de prova:', err);
    res.status(500).json({ error: 'Erro ao criar nota de prova' });
  }
};

// PUT - Atualizar prova (corrigido: construção dinâmica de params para evitar splice incorreto)
export const atualizarProva = async (req: Request, res: Response) => {
  const { id } = req.params;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { Titulo, Descricao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, Id_Bimestre, Id_GradeDisciplina } = req.body;

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