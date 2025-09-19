import { Request, Response } from 'express';
import mysql, { RowDataPacket } from 'mysql2';
import db from '../db';

interface Aluno {
  Id: number;
  Nome: string;
  RA: string;
  FotoPerfil: string;
}

interface Professor {
  Id: number;
  Nome: string;
  Email: string;
  FotoPerfil: string;
  Disciplinas: string;
  TotalDisciplinas: number;
}

interface Disciplina {
  Id: number;
  Nome: string;
  Professor: string;
}

interface Atividade {
  Id: number;
  Nome: string;
  Data: string;
  Disciplina: number;
}

interface Prova {
  Id: number;
  Nome: string;
  Data: string;
  Disciplina: number;
}

interface Faltas {
  Id: number;
  Nome: string;
  Data: string;
  Disciplina: number;
}

interface Turma {
  Id: number;
  Nome?: string;
  AnoLetivo?: string;
  Serie?: string;
  Turno?: string;
  Sala?: string;
  alunos?: Aluno[];
  professores?: Professor[];
  disciplinas?: Disciplina[];
  atividades?: Atividade[];
  provas?: Prova[];
  faltas?: Faltas[];
  Status?: string;
}

// Helper genérico com Promise
const queryAsync = <T>(sql: string, params?: unknown[]): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    db.query(sql, params ?? [], (err: Error | null, results: RowDataPacket[]) => {
      if (err) return reject(err);
      resolve(results as T);
    });
  });
};

// Descobre as colunas existentes de uma tabela
async function getTableColumns(table: string): Promise<Set<string>> {
  const rows = await queryAsync<RowDataPacket[]>(`SHOW COLUMNS FROM ${table}`);
  return new Set(rows.map(r => r.Field as string));
}

// Garante existência
export const garantirExistencia = (
  table: string,
  idOuNome: number | string,
  camposAdicionais: Record<string, unknown> = {}
): Promise<number> => {

  if (typeof idOuNome === 'number') {
    return queryAsync<RowDataPacket[]>(`SELECT Id FROM ${table} WHERE Id = ?`, [idOuNome])
      .then(results => {
        if (results.length > 0) return results[0].Id;
        throw new Error(`Registro com ID ${idOuNome} não encontrado em ${table}`);
      });
  }

  return queryAsync<RowDataPacket[]>(`SELECT Id FROM ${table} WHERE Nome = ?`, [idOuNome])
    .then(results => {
      if (results.length > 0) return results[0].Id;

      const campos = ['Nome', ...Object.keys(camposAdicionais)];
      const valores = [idOuNome, ...Object.values(camposAdicionais)];
      const placeholders = campos.map(() => '?').join(', ');

      return queryAsync<mysql.OkPacket>(
        `INSERT INTO ${table} (${campos.join(', ')}) VALUES (${placeholders})`,
        valores
      ).then(insertResult => insertResult.insertId);
    })
    .catch(error => {
      console.error(`Erro ao garantir existência em ${table}:`, error);
      throw error;
    });
};

// Criar turma
export function criarTurma(req: Request, res: Response) {
  const { nome, serie, anoLetivo, turno, sala, capacidadeMaxima, professores, alunos, disciplinas } = req.body;

  Promise.all([
    garantirExistencia('Serie', serie),
    garantirExistencia('Turno', turno),
    garantirExistencia('Sala', sala)
  ])
    .then(([idSerie, idTurno, idSala]) => {
      return queryAsync<mysql.OkPacket>(
        `INSERT INTO Turma (Nome, Id_Serie, AnoLetivo, Id_Turno, Id_Sala, CapacidadeMaxima)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, idSerie, anoLetivo, idTurno, idSala, capacidadeMaxima]
      );
    })
    .then(turmaResult => {
      const idTurma = turmaResult.insertId;

      return Promise.all([
        professores && professores.length > 0 && Promise.all(
          professores.map((prof: { id: number; disciplinas: number[] }) => {
            return Promise.all(
              prof.disciplinas.map(idDisciplina =>
                queryAsync(
                  `INSERT INTO Professor_Turma_Disciplina (Id_Professor, Id_Turma, Id_Disciplina, Status)
                   VALUES (?, ?, ?, 'Ativo')
                   ON DUPLICATE KEY UPDATE Status = 'Ativo'`,
                  [prof.id, idTurma, idDisciplina]
                )
              )
            );
          })
        ),
        alunos && alunos.length > 0 && queryAsync(
          `INSERT INTO Aluno_Turma (Id_Aluno, Id_Turma, Status)
           VALUES ? 
           ON DUPLICATE KEY UPDATE Status = 'Ativo'`,
          [alunos.map((id: number) => [id, idTurma, 'Ativo'])]
        ),
        disciplinas && disciplinas.length > 0 && queryAsync(
          `INSERT INTO Turma_Disciplina (Id_Turma, Id_Disciplina)
           VALUES ?
           ON DUPLICATE KEY UPDATE Id_Turma = Id_Turma`,
          [disciplinas.map((id: number) => [idTurma, id])]
        )
      ]);
    })
    .then(() => {
      res.status(201).json({ success: true, message: 'Turma criada com sucesso' });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao criar turma:', message);
      res.status(500).json({ success: false, message: 'Erro ao criar turma', error: message });
    });
}

// Adicionar/remover aluno
export function adicionarAluno(req: Request, res: Response) {
  const { idTurma, idAluno } = req.params;

  // Verifique se os parâmetros estão definidos
  if (!idTurma || !idAluno) {
    return res.status(400).json({
      success: false,
      message: 'idTurma e idAluno são obrigatórios'
    });
  }

  const sql = `
    INSERT INTO Aluno_Turma (Id_Aluno, Id_Turma, Status)
    VALUES (?, ?, 'Ativo')
    ON DUPLICATE KEY UPDATE Status = 'Ativo'
  `;

  queryAsync<mysql.OkPacket>(sql, [idAluno, idTurma])
    .then(result => {
      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: 'Não foi possível adicionar o aluno'
        });
      }

      res.json({
        success: true,
        message: 'Aluno adicionado à turma com sucesso'
      });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao adicionar aluno:', message);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao adicionar aluno',
        error: message
      });
    });
}


export function removerAluno(req: Request, res: Response) {
  const { idTurma, idAluno } = req.params;

  queryAsync(`
    UPDATE Aluno_Turma 
    SET Status = 'Inativo' 
    WHERE Id_Aluno = ? AND Id_Turma = ?
  `, [idAluno, idTurma])
    .then(() => {
      res.json({
        success: true,
        message: 'Aluno removido da turma com sucesso'
      });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao remover aluno:', message);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao remover aluno',
        error: message
      });
    });
}

// Professor x Turma x Disciplina
export function adicionarProfessorTurmaDisciplina(req: Request, res: Response) {
  const { idTurma, idProfessor, idDisciplina } = req.params;

  // Verifique se os parâmetros estão definidos
  if (!idTurma || !idProfessor || !idDisciplina) {
    return res.status(400).json({
      success: false,
      message: 'idTurma, idProfessor e idDisciplina são obrigatórios'
    });
  }

  const sql = `
    INSERT INTO Professor_Turma_Disciplina (Id_Professor, Id_Turma, Id_Disciplina, Status)
    VALUES (?, ?, ?, 'Ativo')
    ON DUPLICATE KEY UPDATE Status = 'Ativo'
  `;

  queryAsync<mysql.OkPacket>(sql, [idProfessor, idTurma, idDisciplina])
    .then(result => {
      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: 'Não foi possível adicionar o professor à turma e disciplina'
        });
      }

      res.json({
        success: true,
        message: 'Professor adicionado à turma e disciplina com sucesso'
      });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao adicionar professor à turma e disciplina:', message);
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar professor à turma e disciplina',
        error: message
      });
    });
}

// Adicionar disciplina
export function adicionarDisciplina(req: Request, res: Response) {
  const { idTurma, idDisciplina } = req.params;

  queryAsync<mysql.OkPacket>(`
    INSERT INTO Turma_Disciplina (Id_Turma, Id_Disciplina)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE Id_Turma = Id_Turma
  `, [idTurma, idDisciplina])
    .then(() => {
      res.json({
        success: true,
        message: 'Disciplina adicionada à turma com sucesso'
      });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao adicionar disciplina:', message);
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar disciplina',
        error: message
      });
    });
}

// Falta
export async function adicionarFalta(req: Request, res: Response) {
  const { idTurma, idAluno } = req.params;
  const { idDisciplina, dataFalta, justificada = false } = req.body;

  if (!idDisciplina || !dataFalta) {
    return res.status(400).json({
      success: false,
      message: 'É necessário informar idDisciplina e dataFalta'
    });
  }

  try {
    const aluno = await queryAsync<RowDataPacket[]>(`
      SELECT * FROM Aluno_Turma 
      WHERE Id_Aluno = ? AND Id_Turma = ? AND Status = 'Ativo'
    `, [idAluno, idTurma]);

    if (aluno.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado nesta turma ou está inativo'
      });
    }

    const disciplina = await queryAsync<RowDataPacket[]>(`
      SELECT * FROM Turma_Disciplina
      WHERE Id_Turma = ? AND Id_Disciplina = ?
    `, [idTurma, idDisciplina]);

    if (disciplina.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada nesta turma'
      });
    }

    await queryAsync<mysql.OkPacket>(`
      INSERT INTO Falta (Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada)
      VALUES (?, ?, ?, ?, ?)
    `, [idAluno, idTurma, idDisciplina, dataFalta, justificada ? 1 : 0]);

    res.json({
      success: true,
      message: 'Falta adicionada com sucesso'
    });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao adicionar falta:', message);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar falta',
      error: message
    });
  }
}

export async function adicionarProva(req: Request, res: Response) {
  const { idTurma } = req.params;
  const { titulo, descricao, dataEntrega, idProfessor, idDisciplina } = req.body;

  if (!titulo || !descricao || !dataEntrega || !idProfessor || !idDisciplina) {
    return res.status(400).json({
      success: false,
      message: 'É necessário informar titulo, descricao, dataEntrega, idProfessor e idDisciplina'
    });
  }

  try {
    // valida se a disciplina realmente pertence à turma
    const disciplina = await queryAsync<RowDataPacket[]>(`
      SELECT * FROM Turma_Disciplina
      WHERE Id_Turma = ? AND Id_Disciplina = ?
    `, [idTurma, idDisciplina]);

    if (disciplina.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada nesta turma'
      });
      
    }

    await queryAsync<mysql.OkPacket>(`
      INSERT INTO Prova 
        (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?)
    `, [titulo, descricao, dataEntrega, idProfessor, idTurma, idDisciplina]);

    res.json({
      success: true,
      message: 'Prova adicionada com sucesso'
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao adicionar prova:', message);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar prova',
      error: message
    });
  }
}

// Atividade
export async function adicionarAtividade(req: Request, res: Response) {
  const { idTurma } = req.params;
  const { titulo, descricao, dataEntrega, idProfessor, idDisciplina } = req.body;

  if (!titulo || !descricao || !dataEntrega || !idProfessor || !idDisciplina) {
    return res.status(400).json({
      success: false,
      message: 'É necessário informar titulo, descricao, dataEntrega, idProfessor e idDisciplina'
    });
  }

  try {
    // valida se a disciplina realmente pertence à turma
    const disciplina = await queryAsync<RowDataPacket[]>(`
      SELECT * FROM Turma_Disciplina
      WHERE Id_Turma = ? AND Id_Disciplina = ?
    `, [idTurma, idDisciplina]);

    if (disciplina.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada nesta turma'
      });
    }

    await queryAsync<mysql.OkPacket>(`
      INSERT INTO Atividade 
        (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?)
    `, [titulo, descricao, dataEntrega, idProfessor, idTurma, idDisciplina]);

    res.json({
      success: true,
      message: 'Atividade adicionada com sucesso'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao adicionar atividade:', message);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar atividade',
      error: message
    });
  }
}


// Evento
export function adicionarEvento(req: Request, res: Response) {
  const { titulo, descricao, dataInicio, dataFim, local, publicoAlvo } = req.body;

  queryAsync<mysql.OkPacket>(`
    INSERT INTO EventoEscolar (Titulo, Descricao, DataInicio, DataFim, Local, PublicoAlvo)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [titulo, descricao, dataInicio, dataFim, local, publicoAlvo])
    .then(() => {
      res.json({
        success: true,
        message: 'Evento adicionado com sucesso'
      });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao adicionar evento:', message);
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar evento',
        error: message
      });
    });
}

// Notas e faltas por aluno
export async function visualizarNotasItens(req: Request, res: Response) {
  const { idAluno } = req.params;

  try {
    const notas = await queryAsync<RowDataPacket[]>(`
      SELECT n.Id, n.Valor, n.Tipo, 
             CASE WHEN n.Tipo = 'Atividade' THEN a.Titulo ELSE p.Nome END AS NomeItem,
             CASE WHEN n.Tipo = 'Atividade' THEN a.DataEntrega ELSE p.Data END AS Data
      FROM NotaItem n
      LEFT JOIN Atividade a ON n.Tipo = 'Atividade' AND n.Id_Item = a.Id
      LEFT JOIN Prova p ON n.Tipo = 'Prova' AND n.Id_Item = p.Id
      WHERE n.Id_Aluno = ?
      ORDER BY Data
    `, [idAluno]);

    res.json({ success: true, data: notas });
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar notas', error: error instanceof Error ? error.message : error });
  }
}


// Turma completa
// Turma completa
export async function obterTurmaCompleta(req: Request, res: Response) {
  const { id } = req.params; // Obter o ID da turma a partir dos parâmetros da requisição

  try {
    // Descobrir colunas reais da tabela Prova (para montar SELECT sem quebrar)
    const provaCols = await getTableColumns('Prova');

    const provaTituloCol =
      provaCols.has('Titulo') ? 'pr.Titulo' :
      provaCols.has('Nome') ? 'pr.Nome' : 'NULL';

    const provaDescricaoCol =
      provaCols.has('Descricao') ? 'pr.Descricao' : 'NULL';

    const provaDataCol =
      provaCols.has('DataRealizacao') ? 'pr.DataRealizacao' :
      provaCols.has('Data') ? 'pr.Data' :
      provaCols.has('DataEntrega') ? 'pr.DataEntrega' : 'NULL';

    const provaValorCol =
      provaCols.has('ValorMaximo') ? 'pr.ValorMaximo' :
      provaCols.has('Valor') ? 'pr.Valor' : 'NULL';

    const hasIdDisciplina = provaCols.has('Id_Disciplina');
    const hasIdProfessor  = provaCols.has('Id_Professor');
    const hasIdTurma      = provaCols.has('Id_Turma');

    const joinProfessor = hasIdProfessor ? 'LEFT JOIN Professor p ON pr.Id_Professor = p.Id' : '';
    const joinDisciplina = hasIdDisciplina ? 'LEFT JOIN Disciplina d ON pr.Id_Disciplina = d.Id' : '';

    const campoProfessor = hasIdProfessor ? 'p.Nome AS Professor' : 'NULL AS Professor';
    const campoDisciplina = hasIdDisciplina ? 'd.Nome AS Disciplina' : 'NULL AS Disciplina';

    const whereTurma = hasIdTurma ? 'WHERE pr.Id_Turma = ?' : '';
    const orderProva = provaDataCol !== 'NULL' ? `ORDER BY ${provaDataCol}` : 'ORDER BY pr.Id';

    // Buscar a turma específica pelo ID
    const turmas = await queryAsync<RowDataPacket[]>(`
      SELECT t.Id, t.Nome, t.AnoLetivo, s.Nome AS Serie, tr.Nome AS Turno, sl.Nome AS Sala
      FROM Turma t
      LEFT JOIN Serie s ON t.Id_Serie = s.Id
      LEFT JOIN Turno tr ON t.Id_Turno = tr.Id
      LEFT JOIN Sala sl ON t.Id_Sala = sl.Id
      WHERE t.Id = ? AND t.Status = 'Ativo'
    `, [id]);

    if (turmas.length === 0) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada' });
    }

    const turma = turmas[0]; // Obter a turma encontrada

    // Buscar detalhes da turma
    const [alunos, professores, disciplinas, atividades, provas, faltas] = await Promise.all([
      // Alunos
      queryAsync<RowDataPacket[]>(`
        SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
        FROM Aluno a
        INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
        WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
        ORDER BY a.Nome
      `, [turma.Id]),

      // Professores com disciplinas
      queryAsync<RowDataPacket[]>(`
        SELECT p.Id, p.Nome, p.Email, p.FotoPerfil, 
               GROUP_CONCAT(d.Nome SEPARATOR ', ') AS Disciplinas,
               COUNT(d.Id) AS TotalDisciplinas
        FROM Professor p
        INNER JOIN Professor_Turma_Disciplina ptd ON ptd.Id_Professor = p.Id
        INNER JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
        WHERE ptd.Id_Turma = ? AND ptd.Status = 'Ativo'
        GROUP BY p.Id, p.Nome, p.Email, p.FotoPerfil
        ORDER BY p.Nome
      `, [turma.Id]),

      // Disciplinas
      queryAsync<RowDataPacket[]>(`
        SELECT d.Id, d.Nome, d.Codigo, d.CargaHoraria
        FROM Disciplina d
        INNER JOIN Turma_Disciplina td ON td.Id_Disciplina = d.Id
        WHERE td.Id_Turma = ?
        ORDER BY d.Nome
      `, [turma.Id]),

      // Atividades
      queryAsync<RowDataPacket[]>(`
        SELECT a.Id, a.Titulo, a.Descricao, a.DataEntrega, a.DataCriacao, p.Nome AS Professor
        FROM Atividade a
        INNER JOIN Professor p ON a.Id_Professor = p.Id
        WHERE a.Id_Turma = ?
        ORDER BY a.DataEntrega
      `, [turma.Id]),

      // Provas
      queryAsync<RowDataPacket[]>(`
        SELECT 
          pr.Id,
          ${provaTituloCol}     AS Titulo,
          ${provaDescricaoCol}  AS Descricao,
          ${provaDataCol}       AS Data,
          ${provaValorCol}      AS ValorMaximo,
          ${campoProfessor},
          ${campoDisciplina}
        FROM Prova pr
        ${joinProfessor}
        ${joinDisciplina}
        ${whereTurma}
        ${orderProva}
      `, hasIdTurma ? [turma.Id] : []),

      // Faltas
      queryAsync<RowDataPacket[]>(`
        SELECT f.Id, f.DataFalta, f.Justificada, a.Nome AS Aluno, d.Nome AS Disciplina
        FROM Falta f
        INNER JOIN Aluno a ON f.Id_Aluno = a.Id
        INNER JOIN Disciplina d ON f.Id_Disciplina = d.Id
        WHERE f.Id_Turma = ?
        ORDER BY f.DataFalta
      `, [turma.Id])
    ]);

    const turmaCompleta = { ...turma, alunos, professores, disciplinas, atividades, provas, faltas };

    res.json({
      success: true,
      data: turmaCompleta
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao obter turma completa:', message);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter turma completa',
      error: message
    });
  }
}


// Listar turmas com detalhes completos
export async function listarTurmasComDetalhes(req: Request, res: Response) {
  try {
    const turmas: Turma[] = (await queryAsync<RowDataPacket[]>(`
      SELECT t.Id, t.Nome, t.AnoLetivo, s.Nome AS Serie, tr.Nome AS Turno, sl.Nome AS Sala
      FROM Turma t
      LEFT JOIN Serie s ON t.Id_Serie = s.Id
      LEFT JOIN Turno tr ON t.Id_Turno = tr.Id
      LEFT JOIN Sala sl ON t.Id_Sala = sl.Id
      WHERE t.Status = 'Ativo'
      ORDER BY t.Nome
    `)).map(row => ({
      Id: row.Id,
      Nome: row.Nome,
      AnoLetivo: row.AnoLetivo,
      Serie: row.Serie,
      Turno: row.Turno,
      Sala: row.Sala
    }));

    const turmasCompletas = await Promise.all(
      turmas.map(async turma => {
        const [professores, disciplinas, atividades, provas, faltas, alunos] = await Promise.all([
          queryAsync<RowDataPacket[]>(`
            SELECT p.Id, p.Nome, p.Email, p.FotoPerfil,
            GROUP_CONCAT(d.Nome SEPARATOR ', ') AS Disciplinas
            FROM Professor p
            INNER JOIN Professor_Turma_Disciplina ptd ON ptd.Id_Professor = p.Id
            INNER JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
            WHERE ptd.Id_Turma = ? AND ptd.Status = 'Ativo'
            GROUP BY p.Id
            ORDER BY p.Nome
          `, [turma.Id]),
          queryAsync<RowDataPacket[]>(`
            SELECT d.Id, d.Nome
            FROM Disciplina d
            INNER JOIN Turma_Disciplina td ON td.Id_Disciplina = d.Id
            WHERE td.Id_Turma = ?
            ORDER BY d.Nome
          `, [turma.Id]),
          queryAsync<RowDataPacket[]>(`
            SELECT a.Id, a.Titulo, a.Descricao, a.DataEntrega, p.Nome AS Professor
            FROM Atividade a
            INNER JOIN Professor p ON a.Id_Professor = p.Id
            WHERE a.Id_Turma = ?
            ORDER BY a.DataEntrega
          `, [turma.Id]),
          queryAsync<RowDataPacket[]>(`
            SELECT pr.Id, pr.Titulo, pr.Descricao, pr.DataEntrega, p.Nome AS Professor, d.Nome AS Disciplina
            FROM Prova pr
            INNER JOIN Professor p ON pr.Id_Professor = p.Id
            INNER JOIN Disciplina d ON pr.Id_Disciplina = d.Id
            WHERE pr.Id_Turma = ?
            ORDER BY pr.DataEntrega
          `, [turma.Id]),
          queryAsync<RowDataPacket[]>(`
            SELECT f.Id, a.Nome AS NomeAluno, f.DataFalta AS Data, d.Nome AS Disciplina
            FROM Falta f
            INNER JOIN Aluno a ON f.Id_Aluno = a.Id
            INNER JOIN Disciplina d ON f.Id_Disciplina = d.Id
            WHERE f.Id_Turma = ?
          `, [turma.Id]),
          queryAsync<RowDataPacket[]>(`
            SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
            FROM Aluno a
            INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
            WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
          `, [turma.Id])
        ]);

        return { ...turma, professores, disciplinas, atividades, provas, faltas, alunos };
      })
    );

    res.status(200).json({ success: true, turmas: turmasCompletas });
  } catch (error) {
    console.error('Erro ao listar turmas com detalhes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar turmas com detalhes',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export function adicionarNotaItem(req: Request, res: Response) {
  const { idTurma, idAluno } = req.params;
  const { tipo, idItem, valor } = req.body; // tipo: 'Atividade' ou 'Prova'
  const nome = req.body.nome; // ou qualquer outra forma de obter o valor de nome
  const anoLetivo = req.body.anoLetivo; // ou qualquer outra forma de obter o valor de anoLetivo
  const serie = req.body.serie; // ou qualquer outra forma de obter o valor de serie
  const turno = req.body.turno; // ou qualquer outra forma de obter o valor de
  const sala = req.body.sala; // ou qualquer outra forma de obter o valor de sala
  const id = req.body.id; // ou qualquer outra forma de obter o valor de id

  if (!tipo || !['Atividade', 'Prova'].includes(tipo)) {
    return res.status(400).json({ success: false, message: 'Tipo inválido' });
  }

  if (!idItem || valor === undefined) {
    return res.status(400).json({ success: false, message: 'idItem e valor são obrigatórios' });
  }

  queryAsync<mysql.OkPacket>(`
    UPDATE Turma
    SET Nome = ?, AnoLetivo = ?, Serie = ?, Turno = ?, Sala = ?
    WHERE Id = ? AND Status = 'Ativo'
  `, [nome, anoLetivo, serie, turno, sala, id])
    .then(result => {
      if (result.affectedRows === 0) {
        throw new Error('Turma não encontrada ou não está ativa');
      }
      return queryAsync<mysql.OkPacket>(`
        INSERT INTO NotaItem (Id_Aluno, Id_Turma, Tipo, Id_Item, Valor)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE Valor = ?
      `, [idAluno, idTurma, tipo, idItem, valor, valor]);
    })
    .then(() => {
      res.json({ success: true, message: 'Nota adicionada com sucesso' });
    })
    .catch(error => {
      console.error('Erro ao adicionar nota:', error);
      res.status(500).json({ success: false, message: 'Erro ao adicionar nota', error: error instanceof Error ? error.message : error });
    });
}


export async function editarTurmaParcial(req: Request, res: Response) {
  const idTurma = Number(req.params.id);

  if (isNaN(idTurma)) {
    return res.status(400).json({ success: false, message: "ID inválido" });
  }

  const { nome, serie, anoLetivo, turno, sala, capacidadeMaxima } = req.body;

  // Monta dinamicamente os campos que foram enviados
  const campos: string[] = [];
  const valores: (string | number)[] = [];

  if (nome) {
    campos.push("Nome = ?");
    valores.push(nome);
  }
  if (serie) {
    const idSerie = await garantirExistencia("Serie", serie);
    campos.push("Id_Serie = ?");
    valores.push(idSerie);
  }
  if (anoLetivo) {
    campos.push("AnoLetivo = ?");
    valores.push(anoLetivo);
  }
  if (turno) {
    const idTurno = await garantirExistencia("Turno", turno);
    campos.push("Id_Turno = ?");
    valores.push(idTurno);
  }
  if (sala) {
    const idSala = await garantirExistencia("Sala", sala);
    campos.push("Id_Sala = ?");
    valores.push(idSala);
  }
  if (capacidadeMaxima) {
    campos.push("CapacidadeMaxima = ?");
    valores.push(capacidadeMaxima);
  }

  if (campos.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Nenhum campo para atualizar foi enviado"
    });
  }

  try {
    // Faz o update apenas dos campos enviados
    const result = await queryAsync<mysql.OkPacket>(
      `UPDATE Turma SET ${campos.join(", ")} WHERE Id = ? AND Status = 'Ativo'`,
      [...valores, idTurma]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Nenhuma alteração feita" });
    }

    // Retorna a turma atualizada
    const [turmaAtualizada] = await queryAsync<Turma[]>(
      `SELECT Id, Nome, AnoLetivo, Serie, Turno, Sala, CapacidadeMaxima 
       FROM Turma WHERE Id = ?`,
      [idTurma]
    );

    res.json({ success: true, message: "Turma atualizada com sucesso", data: turmaAtualizada });
  } catch (error) {
    console.error("Erro ao editar turma parcialmente:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao editar turma",
      error: error instanceof Error ? error.message : error
    });
  }
}



export function excluirTurma(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID da turma é obrigatório' });
  }

  queryAsync<mysql.OkPacket>(`
    UPDATE Turma
    SET Status = 'Inativo'
    WHERE Id = ? AND Status = 'Ativo'
  `, [id])
  .then(result => {
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada ou já está inativa' });
    }
    res.json({ success: true, message: 'Turma excluída com sucesso' });
  })
  .catch(error => {
    console.error('Erro ao excluir turma:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir turma', error: error instanceof Error ? error.message : error });
  });
}

export async function obterTurmaPorId(req: Request, res: Response) {
  const { id } = req.params;

  try {
    // Buscar dados básicos da turma
    const turmas = await queryAsync<RowDataPacket[]>(`
      SELECT t.Id, t.Nome, t.AnoLetivo, s.Nome AS Serie, tr.Nome AS Turno, sl.Nome AS Sala
      FROM Turma t
      LEFT JOIN Serie s ON t.Id_Serie = s.Id
      LEFT JOIN Turno tr ON t.Id_Turno = tr.Id
      LEFT JOIN Sala sl ON t.Id_Sala = sl.Id
      WHERE t.Id = ? AND t.Status = 'Ativo'
    `, [id]);

    if (turmas.length === 0) {
      return res.status(404).json({ success: false, message: 'Turma não encontrada' });
    }

    const turma = turmas[0];

    // Buscar alunos da turma
    const alunos = await queryAsync<RowDataPacket[]>(`
      SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
      FROM Aluno a
      INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
      WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
      ORDER BY a.Nome
    `, [id]);

    // Buscar professores e disciplinas da turma
    const professores = await queryAsync<RowDataPacket[]>(`
      SELECT p.Id, p.Nome, p.Email, p.FotoPerfil, GROUP_CONCAT(d.Nome SEPARATOR ', ') AS Disciplinas
      FROM Professor p
      INNER JOIN Professor_Turma_Disciplina ptd ON ptd.Id_Professor = p.Id
      INNER JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
      WHERE ptd.Id_Turma = ? AND ptd.Status = 'Ativo'
      GROUP BY p.Id, p.Nome, p.Email, p.FotoPerfil
      ORDER BY p.Nome
    `, [id]);

    // Buscar disciplinas da turma
    const disciplinas = await queryAsync<RowDataPacket[]>(`
      SELECT d.Id, d.Nome, d.Codigo, d.CargaHoraria
      FROM Disciplina d
      INNER JOIN Turma_Disciplina td ON td.Id_Disciplina = d.Id
      WHERE td.Id_Turma = ?
      ORDER BY d.Nome
    `, [id]);

    // Montar resposta
    const resposta = {
      ...turma,
      alunos,
      professores,
      disciplinas
    };

    res.json({ success: true, data: resposta });

  } catch (error) {
    console.error('Erro ao obter turma:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter turma', error: error instanceof Error ? error.message : error });
  }
}
