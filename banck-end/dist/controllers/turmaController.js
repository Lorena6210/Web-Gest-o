"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.garantirExistencia = void 0;
exports.criarTurma = criarTurma;
exports.obterTurmaCompleta = obterTurmaCompleta;
exports.listarTurmas = listarTurmas;
exports.adicionarAluno = adicionarAluno;
exports.removerAluno = removerAluno;
exports.adicionarProfessorTurmaDisciplina = adicionarProfessorTurmaDisciplina;
exports.adicionarDisciplina = adicionarDisciplina;
exports.adicionarFalta = adicionarFalta;
exports.adicionarNota = adicionarNota;
exports.adicionarAtividade = adicionarAtividade;
exports.adicionarEvento = adicionarEvento;
exports.visualizarNotasEFaltas = visualizarNotasEFaltas;
const db_1 = __importDefault(require("../db"));
// Função para usar db.query com promessas e tipagem genérica
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        db_1.default.query(sql, params !== null && params !== void 0 ? params : [], (err, results) => {
            if (err)
                return reject(err);
            resolve(results);
        });
    });
};
// Função auxiliar para garantir existência de registros
const garantirExistencia = (table, idOuNome, camposAdicionais = {}) => {
    // Se for número, trata como ID
    if (typeof idOuNome === 'number') {
        return queryAsync(`SELECT Id FROM ${table} WHERE Id = ?`, [idOuNome])
            .then(results => {
            if (results.length > 0)
                return results[0].Id;
            throw new Error(`Registro com ID ${idOuNome} não encontrado em ${table}`);
        });
    }
    // Se for string, trata como Nome
    return queryAsync(`SELECT Id FROM ${table} WHERE Nome = ?`, [idOuNome])
        .then(results => {
        if (results.length > 0)
            return results[0].Id;
        const campos = ['Nome', ...Object.keys(camposAdicionais)];
        const valores = [idOuNome, ...Object.values(camposAdicionais)];
        const placeholders = campos.map(() => '?').join(', ');
        return queryAsync(`INSERT INTO ${table} (${campos.join(', ')}) VALUES (${placeholders})`, valores).then(insertResult => insertResult.insertId);
    })
        .catch(error => {
        console.error(`Erro ao garantir existência em ${table}:`, error);
        throw error;
    });
};
exports.garantirExistencia = garantirExistencia;
// Criar turma com todos os relacionamentos
function criarTurma(req, res) {
    const { nome, serie, anoLetivo, turno, sala, capacidadeMaxima, professores, alunos, disciplinas } = req.body;
    // Garantir existência dos relacionamentos
    Promise.all([
        (0, exports.garantirExistencia)('Serie', serie),
        (0, exports.garantirExistencia)('Turno', turno),
        (0, exports.garantirExistencia)('Sala', sala)
    ])
        .then(([idSerie, idTurno, idSala]) => {
        // Inserir turma principal
        return queryAsync(`INSERT INTO Turma (Nome, Id_Serie, AnoLetivo, Id_Turno, Id_Sala, CapacidadeMaxima)
         VALUES (?, ?, ?, ?, ?, ?)`, [nome, idSerie, anoLetivo, idTurno, idSala, capacidadeMaxima]);
    })
        .then(turmaResult => {
        const idTurma = turmaResult.insertId;
        // Processar relacionamentos em paralelo
        return Promise.all([
            // Professores (com disciplinas)
            professores && professores.length > 0 && Promise.all(professores.map((prof) => {
                return Promise.all(prof.disciplinas.map(idDisciplina => queryAsync(`INSERT INTO Professor_Turma_Disciplina (Id_Professor, Id_Turma, Id_Disciplina, Status)
                   VALUES (?, ?, ?, 'Ativo')
                   ON DUPLICATE KEY UPDATE Status = 'Ativo'`, [prof.id, idTurma, idDisciplina])));
            })),
            // Alunos
            alunos && alunos.length > 0 && queryAsync(`INSERT INTO Aluno_Turma (Id_Aluno, Id_Turma, Status)
           VALUES ? 
           ON DUPLICATE KEY UPDATE Status = 'Ativo'`, [alunos.map((id) => [id, idTurma, 'Ativo'])]),
            // Disciplinas da turma
            disciplinas && disciplinas.length > 0 && queryAsync(`INSERT INTO Turma_Disciplina (Id_Turma, Id_Disciplina)
           VALUES ?
           ON DUPLICATE KEY UPDATE Id_Turma = Id_Turma`, [disciplinas.map((id) => [idTurma, id])])
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
function obterTurmaCompleta(req, res) {
    const idTurma = req.params.id;
    // Obter informações básicas da turma
    queryAsync(`
    SELECT t.*, s.Nome AS Serie, tr.Nome AS Turno, sl.Nome AS Sala
    FROM Turma t
    LEFT JOIN Serie s ON t.Id_Serie = s.Id
    LEFT JOIN Turno tr ON t.Id_Turno = tr.Id
    LEFT JOIN Sala sl ON t.Id_Sala = sl.Id
    WHERE t.Id = ? AND t.Status = 'Ativo'
  `, [idTurma])
        .then((turma) => {
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
            queryAsync(`
        SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
        FROM Aluno a
        INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
        WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
        ORDER BY a.Nome
      `, [idTurma]),
            // Professores com suas disciplinas na turma
            queryAsync(`
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
            queryAsync(`
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
                data: Object.assign(Object.assign({}, turma[0]), { alunos, professores: professoresComDisciplinas, disciplinas })
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
function listarTurmas(req, res) {
    queryAsync(`
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
        .then((turmas) => __awaiter(this, void 0, void 0, function* () {
        // Para cada turma, buscar alunos, professores com disciplinas e disciplinas da turma
        const turmasComRelacionamentos = yield Promise.all(turmas.map((turma) => __awaiter(this, void 0, void 0, function* () {
            const [alunos, professores, disciplinas] = yield Promise.all([
                queryAsync(`
              SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
              FROM Aluno a
              INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
              WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
              ORDER BY a.Nome
            `, [turma.Id]),
                queryAsync(`
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
                queryAsync(`
              SELECT d.Id, d.Nome, d.Codigo, d.CargaHoraria
              FROM Disciplina d
              INNER JOIN Turma_Disciplina td ON td.Id_Disciplina = d.Id
              WHERE td.Id_Turma = ?
              ORDER BY d.Nome
            `, [turma.Id])
            ]);
            return Object.assign(Object.assign({}, turma), { alunos, professores, disciplinas });
        })));
        res.json({
            success: true,
            data: turmasComRelacionamentos
        });
    }))
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
function adicionarAluno(req, res) {
    const { idTurma, idAluno } = req.params;
    queryAsync(`
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
function removerAluno(req, res) {
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
function adicionarProfessorTurmaDisciplina(req, res) {
    const { idTurma, idProfessor, idDisciplina } = req.params;
    const sql = `
    INSERT INTO Professor_Turma_Disciplina (Id_Professor, Id_Turma, Id_Disciplina, Status)
    VALUES (?, ?, ?, 'Ativo')
    ON DUPLICATE KEY UPDATE Status = 'Ativo'
  `;
    queryAsync(sql, [idProfessor, idTurma, idDisciplina])
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
function adicionarDisciplina(req, res) {
    const { idTurma, idDisciplina } = req.params;
    queryAsync(`
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
function adicionarFalta(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const [existing] = yield queryAsync(`
            SELECT Id FROM Falta 
            WHERE Id_Aluno = ? AND Id_Turma = ? 
            AND Id_Disciplina = ? AND DataFalta = ?
        `, [idAluno, idTurma, idDisciplina, dataFalta]);
            if (existing) {
                yield queryAsync(`UPDATE Falta SET Justificada = ? WHERE Id = ?`, [justificada, existing.Id]);
                return res.json({
                    success: true,
                    message: "Falta atualizada com sucesso"
                });
            }
            // Inserir nova falta
            yield queryAsync(`
            INSERT INTO Falta (Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada)
            VALUES (?, ?, ?, ?, ?)
        `, [idAluno, idTurma, idDisciplina, dataFalta, justificada]);
            res.json({
                success: true,
                message: "Falta registrada com sucesso"
            });
        }
        catch (error) {
            console.error("Erro no banco de dados:", error);
            res.status(500).json({
                success: false,
                message: "Erro ao processar a falta",
                error: error instanceof Error ? error.message : "Erro desconhecido"
            });
        }
    });
}
// Adicionar nota a um aluno na turma
function adicionarNota(req, res) {
    const { idTurma, idAluno } = req.params;
    const { idBimestre, valor } = req.body;
    queryAsync(`
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
function adicionarAtividade(req, res) {
    const { idTurma } = req.params;
    const { titulo, descricao, dataEntrega, idProfessor } = req.body;
    queryAsync(`
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
function adicionarEvento(req, res) {
    const { titulo, descricao, dataInicio, dataFim, local, publicoAlvo } = req.body;
    queryAsync(`
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
function visualizarNotasEFaltas(req, res) {
    const { idAluno } = req.params;
    Promise.all([
        queryAsync(`
      SELECT n.Id, n.Valor, b.Nome AS Bimestre
      FROM Nota n
      INNER JOIN Bimestre b ON n.Id_Bimestre = b.Id
      WHERE n.Id_Aluno = ?
    `, [idAluno]),
        queryAsync(`
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
