import { Request, Response } from 'express';
import mysql, { RowDataPacket } from 'mysql2';
import db from '../db';

// Função para usar db.query com promessas e tipagem genérica
const queryAsync = <T>(sql: string, params?: unknown[]): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    db.query(sql, params ?? [], (err, results) => {
      if (err) return reject(err);
      resolve(results as T);
    });
  });
};

// Função auxiliar para garantir existência de registros
export const garantirExistencia = (
  table: string,
  idOuNome: number | string,
  camposAdicionais: Record<string, unknown> = {}
): Promise<number> => {

  // Se for número, trata como ID
  if (typeof idOuNome === 'number') {
    return queryAsync<RowDataPacket[]>(`SELECT Id FROM ${table} WHERE Id = ?`, [idOuNome])
      .then(results => {
        if (results.length > 0) return results[0].Id;
        throw new Error(`Registro com ID ${idOuNome} não encontrado em ${table}`);
      });
  }

  // Se for string, trata como Nome
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

// Criar turma com todos os relacionamentos
export function criarTurma(req: Request, res: Response) {
  const { nome, serie, anoLetivo, turno, sala, capacidadeMaxima, professores, alunos, disciplinas } = req.body;

  // Garantir existência dos relacionamentos
  Promise.all([
    garantirExistencia('Serie', serie),
    garantirExistencia('Turno', turno),
    garantirExistencia('Sala', sala)
  ])
    .then(([idSerie, idTurno, idSala]) => {
      // Inserir turma principal
      return queryAsync<mysql.OkPacket>(
        `INSERT INTO Turma (Nome, Id_Serie, AnoLetivo, Id_Turno, Id_Sala, CapacidadeMaxima)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, idSerie, anoLetivo, idTurno, idSala, capacidadeMaxima]
      );
    })
    .then(turmaResult => {
      const idTurma = turmaResult.insertId;

      // Processar relacionamentos em paralelo
      return Promise.all([
        // Professores (com disciplinas)
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

        // Alunos
        alunos && alunos.length > 0 && queryAsync(
          `INSERT INTO Aluno_Turma (Id_Aluno, Id_Turma, Status)
           VALUES ? 
           ON DUPLICATE KEY UPDATE Status = 'Ativo'`,
          [alunos.map((id: number) => [id, idTurma, 'Ativo'])]
        ),
        
        // Disciplinas da turma
        disciplinas && disciplinas.length > 0 && queryAsync(
          `INSERT INTO Turma_Disciplina (Id_Turma, Id_Disciplina)
           VALUES ?
           ON DUPLICATE KEY UPDATE Id_Turma = Id_Turma`,
          [disciplinas.map((id: number) => [idTurma, id])]
        )
      ]);
    })
    .then(() => {
      res.status(201).json({ 
        success: true,
        message: 'Turma criada com sucesso'
      });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao criar turma:', message);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao criar turma',
        error: message
      });
    });
}

// Obter turma com todos os relacionamentos
export function obterTurmaCompleta(req: Request, res: Response) {
  const idTurma = req.params.id;

  // Obter informações básicas da turma
  queryAsync<RowDataPacket[]>(`
    SELECT t.*, s.Nome AS Serie, tr.Nome AS Turno, sl.Nome AS Sala
    FROM Turma t
    LEFT JOIN Serie s ON t.Id_Serie = s.Id
    LEFT JOIN Turno tr ON t.Id_Turno = tr.Id
    LEFT JOIN Sala sl ON t.Id_Sala = sl.Id
    WHERE t.Id = ? AND t.Status = 'Ativo'
  `, [idTurma])
  .then((turma: RowDataPacket[]) => {
    if (turma.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
      return;
    }

    // Obter todos os relacionamentos em paralelo
    return Promise.all([
      // Alunos da turma (sem a coluna Email)
      queryAsync<RowDataPacket[]>(`
        SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
        FROM Aluno a
        INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
        WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
        ORDER BY a.Nome
      `, [idTurma]),
      
      // Professores com suas disciplinas na turma
      queryAsync<RowDataPacket[]>(`
        SELECT p.Id, p.Nome, p.Email, p.FotoPerfil, 
              GROUP_CONCAT(d.Nome SEPARATOR ', ') AS Disciplinas,
              COUNT(d.Id) AS TotalDisciplinas
        FROM Professor p
        INNER JOIN Professor_Turma_Disciplina ptd ON ptd.Id_Professor = p.Id
        INNER JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
        WHERE ptd.Id_Turma = ? AND ptd.Status = 'Ativo'
        GROUP BY p.Id
        ORDER BY p.Nome
      `, [idTurma]),
      
      // Disciplinas da turma
      queryAsync<RowDataPacket[]>(`
        SELECT d.Id, d.Nome, d.Codigo, d.CargaHoraria
        FROM Disciplina d
        INNER JOIN Turma_Disciplina td ON td.Id_Disciplina = d.Id
        WHERE td.Id_Turma = ?
        ORDER BY d.Nome
      `, [idTurma])
    ])
    .then(([alunos, professoresComDisciplinas, disciplinas]) => {
      res.json({
        success: true,
        data: {
          ...turma[0],
          alunos,
          professores: professoresComDisciplinas,
          disciplinas
        }
      });
    });
  })
  .catch(error => {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao obter turma completa:', message);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter turma completa',
      error: message
    });
  });
}

export function listarTurmas(req: Request, res: Response) {
  queryAsync<RowDataPacket[]>(`
    SELECT t.Id, t.Nome, s.Nome AS Serie, t.AnoLetivo, tr.Nome AS Turno,
           COUNT(DISTINCT at.Id_Aluno) AS TotalAlunos,
           COUNT(DISTINCT ptd.Id_Professor) AS TotalProfessores
    FROM Turma t
    LEFT JOIN Serie s ON t.Id_Serie = s.Id
    LEFT JOIN Turno tr ON t.Id_Turno = tr.Id
    LEFT JOIN Aluno_Turma at ON at.Id_Turma = t.Id AND at.Status = 'Ativo'
    LEFT JOIN Professor_Turma_Disciplina ptd ON ptd.Id_Turma = t.Id AND ptd.Status = 'Ativo'
    WHERE t.Status = 'Ativo'
    GROUP BY t.Id
    ORDER BY t.Nome
  `)
    .then(async turmas => {
      // Para cada turma, buscar alunos, professores com disciplinas e disciplinas da turma
      const turmasComRelacionamentos = await Promise.all(
        turmas.map(async turma => {
          const [alunos, professores, disciplinas] = await Promise.all([
            queryAsync<RowDataPacket[]>(`
              SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
              FROM Aluno a
              INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
              WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
              ORDER BY a.Nome
            `, [turma.Id]),

            queryAsync<RowDataPacket[]>(`
              SELECT p.Id, p.Nome, p.Email, p.FotoPerfil, 
                     GROUP_CONCAT(d.Nome SEPARATOR ', ') AS Disciplinas,
                     COUNT(d.Id) AS TotalDisciplinas
              FROM Professor p
              INNER JOIN Professor_Turma_Disciplina ptd ON ptd.Id_Professor = p.Id
              INNER JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
              WHERE ptd.Id_Turma = ? AND ptd.Status = 'Ativo'
              GROUP BY p.Id
              ORDER BY p.Nome
            `, [turma.Id]),

            queryAsync<RowDataPacket[]>(`
              SELECT d.Id, d.Nome, d.Codigo, d.CargaHoraria
              FROM Disciplina d
              INNER JOIN Turma_Disciplina td ON td.Id_Disciplina = d.Id
              WHERE td.Id_Turma = ?
              ORDER BY d.Nome
            `, [turma.Id])
          ]);

          return { ...turma, alunos, professores, disciplinas };
        })
      );

      res.json({ 
        success: true,
        data: turmasComRelacionamentos
      });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao listar turmas:', message);
      res.status(500).json({ 
        success: false,
        message: 'Erro ao listar turmas',
        error: message
      });
    });
}


// Adicionar aluno à turma
export function adicionarAluno(req: Request, res: Response) {
  const { idTurma, idAluno } = req.params;

  queryAsync<mysql.OkPacket>(`
    INSERT INTO Aluno_Turma (Id_Aluno, Id_Turma, Status)
    VALUES (?, ?, 'Ativo')
    ON DUPLICATE KEY UPDATE Status = 'Ativo'
  `, [idAluno, idTurma])
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

// Remover aluno da turma
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

// Adicionar professor a uma turma e disciplina
export function adicionarProfessorTurmaDisciplina(req: Request, res: Response) {
  const { idTurma, idProfessor, idDisciplina } = req.params;

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

// Adicionar disciplina à turma
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

// Adicionar falta a um aluno na turma
export async function adicionarFalta(req: Request, res: Response) {
    const { idTurma, idAluno } = req.params;
    const { idDisciplina, dataFalta, justificada = false } = req.body;

    // Validação avançada
    if (typeof idDisciplina === 'undefined') {
        return res.status(400).json({
            success: false,
            message: "O campo 'idDisciplina' é obrigatório",
            requiredFields: {
                idDisciplina: "number (ID da disciplina)",
                dataFalta: "string (formato YYYY-MM-DD)",
                justificada: "boolean (opcional)"
            }
        });
    }

    if (!dataFalta || !/^\d{4}-\d{2}-\d{2}$/.test(dataFalta)) {
        return res.status(400).json({
            success: false,
            message: "O campo 'dataFalta' é obrigatório no formato YYYY-MM-DD",
            example: {
                "idDisciplina": 1,
                "dataFalta": "2023-11-20",
                "justificada": false
            }
        });
    }

    try {
        // Verificar duplicata
        const [existing] = await queryAsync<RowDataPacket[]>(`
            SELECT Id FROM Falta 
            WHERE Id_Aluno = ? AND Id_Turma = ? 
            AND Id_Disciplina = ? AND DataFalta = ?
        `, [idAluno, idTurma, idDisciplina, dataFalta]);

        if (existing) {
            await queryAsync(`UPDATE Falta SET Justificada = ? WHERE Id = ?`, 
                [justificada, existing.Id]);
            return res.json({ 
                success: true,
                message: "Falta atualizada com sucesso" 
            });
        }

        // Inserir nova falta
        await queryAsync(`
            INSERT INTO Falta (Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada)
            VALUES (?, ?, ?, ?, ?)
        `, [idAluno, idTurma, idDisciplina, dataFalta, justificada]);

        res.json({ 
            success: true,
            message: "Falta registrada com sucesso" 
        });

    } catch (error) {
        console.error("Erro no banco de dados:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao processar a falta",
            error: error instanceof Error ? error.message : "Erro desconhecido"
        });
    }
}

// Adicionar nota a um aluno na turma
export function adicionarNota(req: Request, res: Response) {
  const { idTurma, idAluno } = req.params;
  const { idBimestre, valor } = req.body;

  queryAsync<mysql.OkPacket>(`
    INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Valor)
    VALUES (?, ?, ?, ?)
  `, [idAluno, idTurma, idBimestre, valor])
    .then(() => {
      res.json({
        success: true,
        message: 'Nota adicionada com sucesso'
      });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao adicionar nota:', message);
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar nota',
        error: message
      });
    });
}

// Adicionar atividade à turma
export function adicionarAtividade(req: Request, res: Response) {
  const { idTurma } = req.params;
  const { titulo, descricao, dataEntrega, idProfessor } = req.body;

  queryAsync<mysql.OkPacket>(`
    INSERT INTO Atividade (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma)
    VALUES (?, ?, CURDATE(), ?, ?, ?)
  `, [titulo, descricao, dataEntrega, idProfessor, idTurma])
    .then(() => {
      res.json({
        success: true,
        message: 'Atividade adicionada com sucesso'
      });
    })
    .catch(error => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao adicionar atividade:', message);
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar atividade',
        error: message
      });
    });
}

// Adicionar evento à turma
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

// Visualizar notas e faltas de um aluno
export function visualizarNotasEFaltas(req: Request, res: Response) {
  const { idAluno } = req.params;

  Promise.all([
    queryAsync<RowDataPacket[]>(`
      SELECT n.Id, n.Valor, b.Nome AS Bimestre
      FROM Nota n
      INNER JOIN Bimestre b ON n.Id_Bimestre = b.Id
      WHERE n.Id_Aluno = ?
    `, [idAluno]),

    queryAsync<RowDataPacket[]>(`
      SELECT f.DataFalta, f.Justificada, d.Nome AS Disciplina
      FROM Falta f
      INNER JOIN Disciplina d ON f.Id_Disciplina = d.Id
      WHERE f.Id_Aluno = ?
    `, [idAluno])
  ])
  .then(([notas, faltas]) => {
    res.json({
      success: true,
      data: {
        notas,
        faltas
      }
    });
  })
  .catch(error => {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao visualizar notas e faltas:', message);
    res.status(500).json({
      success: false,
      message: 'Erro ao visualizar notas e faltas',
      error: message
    });
  });
}
