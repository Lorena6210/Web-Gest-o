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
exports.adicionarAluno = adicionarAluno;
exports.removerAluno = removerAluno;
exports.adicionarProfessorTurmaDisciplina = adicionarProfessorTurmaDisciplina;
exports.adicionarDisciplina = adicionarDisciplina;
exports.adicionarFalta = adicionarFalta;
exports.adicionarProva = adicionarProva;
exports.adicionarAtividade = adicionarAtividade;
exports.adicionarEvento = adicionarEvento;
exports.visualizarNotasItens = visualizarNotasItens;
exports.obterTurmaCompleta = obterTurmaCompleta;
exports.listarTurmasComDetalhes = listarTurmasComDetalhes;
exports.adicionarNotaItem = adicionarNotaItem;
exports.editarTurmaParcial = editarTurmaParcial;
exports.excluirTurma = excluirTurma;
exports.obterTurmaPorId = obterTurmaPorId;
const db_1 = __importDefault(require("../db"));
// Helper genérico com Promise
const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        db_1.default.query(sql, params !== null && params !== void 0 ? params : [], (err, results) => {
            if (err)
                return reject(err);
            resolve(results);
        });
    });
};
// Descobre as colunas existentes de uma tabela
function getTableColumns(table) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield queryAsync(`SHOW COLUMNS FROM ${table}`);
        return new Set(rows.map(r => r.Field));
    });
}
// Garante existência
const garantirExistencia = (table, idOuNome, camposAdicionais = {}) => {
    if (typeof idOuNome === 'number') {
        return queryAsync(`SELECT Id FROM ${table} WHERE Id = ?`, [idOuNome])
            .then(results => {
            if (results.length > 0)
                return results[0].Id;
            throw new Error(`Registro com ID ${idOuNome} não encontrado em ${table}`);
        });
    }
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
// Criar turma
function criarTurma(req, res) {
    const { nome, serie, anoLetivo, turno, sala, capacidadeMaxima, professores, alunos, disciplinas } = req.body;
    Promise.all([
        (0, exports.garantirExistencia)('Serie', serie),
        (0, exports.garantirExistencia)('Turno', turno),
        (0, exports.garantirExistencia)('Sala', sala)
    ])
        .then(([idSerie, idTurno, idSala]) => {
        return queryAsync(`INSERT INTO Turma (Nome, Id_Serie, AnoLetivo, Id_Turno, Id_Sala, CapacidadeMaxima)
         VALUES (?, ?, ?, ?, ?, ?)`, [nome, idSerie, anoLetivo, idTurno, idSala, capacidadeMaxima]);
    })
        .then(turmaResult => {
        const idTurma = turmaResult.insertId;
        return Promise.all([
            professores && professores.length > 0 && Promise.all(professores.map((prof) => {
                return Promise.all(prof.disciplinas.map(idDisciplina => queryAsync(`INSERT INTO Professor_Turma_Disciplina (Id_Professor, Id_Turma, Id_Disciplina, Status)
                   VALUES (?, ?, ?, 'Ativo')
                   ON DUPLICATE KEY UPDATE Status = 'Ativo'`, [prof.id, idTurma, idDisciplina])));
            })),
            alunos && alunos.length > 0 && queryAsync(`INSERT INTO Aluno_Turma (Id_Aluno, Id_Turma, Status)
           VALUES ? 
           ON DUPLICATE KEY UPDATE Status = 'Ativo'`, [alunos.map((id) => [id, idTurma, 'Ativo'])]),
            disciplinas && disciplinas.length > 0 && queryAsync(`INSERT INTO Turma_Disciplina (Id_Turma, Id_Disciplina)
           VALUES ?
           ON DUPLICATE KEY UPDATE Id_Turma = Id_Turma`, [disciplinas.map((id) => [idTurma, id])])
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
function adicionarAluno(req, res) {
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
    queryAsync(sql, [idAluno, idTurma])
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
// Professor x Turma x Disciplina
function adicionarProfessorTurmaDisciplina(req, res) {
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
// Adicionar disciplina
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
// Falta
function adicionarFalta(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { idTurma, idAluno } = req.params;
        const { idDisciplina, dataFalta, justificada = false } = req.body;
        if (!idDisciplina || !dataFalta) {
            return res.status(400).json({
                success: false,
                message: 'É necessário informar idDisciplina e dataFalta'
            });
        }
        try {
            const aluno = yield queryAsync(`
      SELECT * FROM Aluno_Turma 
      WHERE Id_Aluno = ? AND Id_Turma = ? AND Status = 'Ativo'
    `, [idAluno, idTurma]);
            if (aluno.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Aluno não encontrado nesta turma ou está inativo'
                });
            }
            const disciplina = yield queryAsync(`
      SELECT * FROM Turma_Disciplina
      WHERE Id_Turma = ? AND Id_Disciplina = ?
    `, [idTurma, idDisciplina]);
            if (disciplina.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Disciplina não encontrada nesta turma'
                });
            }
            yield queryAsync(`
      INSERT INTO Falta (Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada)
      VALUES (?, ?, ?, ?, ?)
    `, [idAluno, idTurma, idDisciplina, dataFalta, justificada ? 1 : 0]);
            res.json({
                success: true,
                message: 'Falta adicionada com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao adicionar falta:', message);
            res.status(500).json({
                success: false,
                message: 'Erro ao adicionar falta',
                error: message
            });
        }
    });
}
function adicionarProva(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const disciplina = yield queryAsync(`
      SELECT * FROM Turma_Disciplina
      WHERE Id_Turma = ? AND Id_Disciplina = ?
    `, [idTurma, idDisciplina]);
            if (disciplina.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Disciplina não encontrada nesta turma'
                });
            }
            yield queryAsync(`
      INSERT INTO Prova 
        (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?)
    `, [titulo, descricao, dataEntrega, idProfessor, idTurma, idDisciplina]);
            res.json({
                success: true,
                message: 'Prova adicionada com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao adicionar prova:', message);
            res.status(500).json({
                success: false,
                message: 'Erro ao adicionar prova',
                error: message
            });
        }
    });
}
// Atividade
function adicionarAtividade(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const disciplina = yield queryAsync(`
      SELECT * FROM Turma_Disciplina
      WHERE Id_Turma = ? AND Id_Disciplina = ?
    `, [idTurma, idDisciplina]);
            if (disciplina.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Disciplina não encontrada nesta turma'
                });
            }
            yield queryAsync(`
      INSERT INTO Atividade 
        (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?)
    `, [titulo, descricao, dataEntrega, idProfessor, idTurma, idDisciplina]);
            res.json({
                success: true,
                message: 'Atividade adicionada com sucesso'
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao adicionar atividade:', message);
            res.status(500).json({
                success: false,
                message: 'Erro ao adicionar atividade',
                error: message
            });
        }
    });
}
// Evento
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
// Notas e faltas por aluno
function visualizarNotasItens(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { idAluno } = req.params;
        try {
            const notas = yield queryAsync(`
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
        }
        catch (error) {
            console.error('Erro ao buscar notas:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar notas', error: error instanceof Error ? error.message : error });
        }
    });
}
// Turma completa
// Turma completa
function obterTurmaCompleta(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params; // Obter o ID da turma a partir dos parâmetros da requisição
        try {
            // Descobrir colunas reais da tabela Prova (para montar SELECT sem quebrar)
            const provaCols = yield getTableColumns('Prova');
            const provaTituloCol = provaCols.has('Titulo') ? 'pr.Titulo' :
                provaCols.has('Nome') ? 'pr.Nome' : 'NULL';
            const provaDescricaoCol = provaCols.has('Descricao') ? 'pr.Descricao' : 'NULL';
            const provaDataCol = provaCols.has('DataRealizacao') ? 'pr.DataRealizacao' :
                provaCols.has('Data') ? 'pr.Data' :
                    provaCols.has('DataEntrega') ? 'pr.DataEntrega' : 'NULL';
            const provaValorCol = provaCols.has('ValorMaximo') ? 'pr.ValorMaximo' :
                provaCols.has('Valor') ? 'pr.Valor' : 'NULL';
            const hasIdDisciplina = provaCols.has('Id_Disciplina');
            const hasIdProfessor = provaCols.has('Id_Professor');
            const hasIdTurma = provaCols.has('Id_Turma');
            const joinProfessor = hasIdProfessor ? 'LEFT JOIN Professor p ON pr.Id_Professor = p.Id' : '';
            const joinDisciplina = hasIdDisciplina ? 'LEFT JOIN Disciplina d ON pr.Id_Disciplina = d.Id' : '';
            const campoProfessor = hasIdProfessor ? 'p.Nome AS Professor' : 'NULL AS Professor';
            const campoDisciplina = hasIdDisciplina ? 'd.Nome AS Disciplina' : 'NULL AS Disciplina';
            const whereTurma = hasIdTurma ? 'WHERE pr.Id_Turma = ?' : '';
            const orderProva = provaDataCol !== 'NULL' ? `ORDER BY ${provaDataCol}` : 'ORDER BY pr.Id';
            // Buscar a turma específica pelo ID
            const turmas = yield queryAsync(`
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
            const [alunos, professores, disciplinas, atividades, provas, faltas] = yield Promise.all([
                // Alunos
                queryAsync(`
        SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
        FROM Aluno a
        INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
        WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
        ORDER BY a.Nome
      `, [turma.Id]),
                // Professores com disciplinas
                queryAsync(`
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
                queryAsync(`
        SELECT d.Id, d.Nome, d.Codigo, d.CargaHoraria
        FROM Disciplina d
        INNER JOIN Turma_Disciplina td ON td.Id_Disciplina = d.Id
        WHERE td.Id_Turma = ?
        ORDER BY d.Nome
      `, [turma.Id]),
                // Atividades
                queryAsync(`
        SELECT a.Id, a.Titulo, a.Descricao, a.DataEntrega, a.DataCriacao, p.Nome AS Professor
        FROM Atividade a
        INNER JOIN Professor p ON a.Id_Professor = p.Id
        WHERE a.Id_Turma = ?
        ORDER BY a.DataEntrega
      `, [turma.Id]),
                // Provas
                queryAsync(`
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
                queryAsync(`
        SELECT f.Id, f.DataFalta, f.Justificada, a.Nome AS Aluno, d.Nome AS Disciplina
        FROM Falta f
        INNER JOIN Aluno a ON f.Id_Aluno = a.Id
        INNER JOIN Disciplina d ON f.Id_Disciplina = d.Id
        WHERE f.Id_Turma = ?
        ORDER BY f.DataFalta
      `, [turma.Id])
            ]);
            const turmaCompleta = Object.assign(Object.assign({}, turma), { alunos, professores, disciplinas, atividades, provas, faltas });
            res.json({
                success: true,
                data: turmaCompleta
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao obter turma completa:', message);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter turma completa',
                error: message
            });
        }
    });
}
// Listar turmas com detalhes completos
function listarTurmasComDetalhes(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const turmas = (yield queryAsync(`
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
            const turmasCompletas = yield Promise.all(turmas.map((turma) => __awaiter(this, void 0, void 0, function* () {
                const [professores, disciplinas, atividades, provas, faltas, alunos] = yield Promise.all([
                    queryAsync(`
            SELECT p.Id, p.Nome, p.Email, p.FotoPerfil,
            GROUP_CONCAT(d.Nome SEPARATOR ', ') AS Disciplinas
            FROM Professor p
            INNER JOIN Professor_Turma_Disciplina ptd ON ptd.Id_Professor = p.Id
            INNER JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
            WHERE ptd.Id_Turma = ? AND ptd.Status = 'Ativo'
            GROUP BY p.Id
            ORDER BY p.Nome
          `, [turma.Id]),
                    queryAsync(`
            SELECT d.Id, d.Nome
            FROM Disciplina d
            INNER JOIN Turma_Disciplina td ON td.Id_Disciplina = d.Id
            WHERE td.Id_Turma = ?
            ORDER BY d.Nome
          `, [turma.Id]),
                    queryAsync(`
            SELECT a.Id, a.Titulo, a.Descricao, a.DataEntrega, p.Nome AS Professor
            FROM Atividade a
            INNER JOIN Professor p ON a.Id_Professor = p.Id
            WHERE a.Id_Turma = ?
            ORDER BY a.DataEntrega
          `, [turma.Id]),
                    queryAsync(`
            SELECT pr.Id, pr.Titulo, pr.Descricao, pr.DataEntrega, p.Nome AS Professor, d.Nome AS Disciplina
            FROM Prova pr
            INNER JOIN Professor p ON pr.Id_Professor = p.Id
            INNER JOIN Disciplina d ON pr.Id_Disciplina = d.Id
            WHERE pr.Id_Turma = ?
            ORDER BY pr.DataEntrega
          `, [turma.Id]),
                    queryAsync(`
            SELECT f.Id, a.Nome AS NomeAluno, f.DataFalta AS Data, d.Nome AS Disciplina
            FROM Falta f
            INNER JOIN Aluno a ON f.Id_Aluno = a.Id
            INNER JOIN Disciplina d ON f.Id_Disciplina = d.Id
            WHERE f.Id_Turma = ?
          `, [turma.Id]),
                    queryAsync(`
            SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
            FROM Aluno a
            INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
            WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
          `, [turma.Id])
                ]);
                return Object.assign(Object.assign({}, turma), { professores, disciplinas, atividades, provas, faltas, alunos });
            })));
            res.status(200).json({ success: true, turmas: turmasCompletas });
        }
        catch (error) {
            console.error('Erro ao listar turmas com detalhes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao listar turmas com detalhes',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    });
}
function adicionarNotaItem(req, res) {
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
    queryAsync(`
    UPDATE Turma
    SET Nome = ?, AnoLetivo = ?, Serie = ?, Turno = ?, Sala = ?
    WHERE Id = ? AND Status = 'Ativo'
  `, [nome, anoLetivo, serie, turno, sala, id])
        .then(result => {
        if (result.affectedRows === 0) {
            throw new Error('Turma não encontrada ou não está ativa');
        }
        return queryAsync(`
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
function editarTurmaParcial(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idTurma = Number(req.params.id);
        if (isNaN(idTurma)) {
            return res.status(400).json({ success: false, message: "ID inválido" });
        }
        const { nome, serie, anoLetivo, turno, sala, capacidadeMaxima } = req.body;
        // Monta dinamicamente os campos que foram enviados
        const campos = [];
        const valores = [];
        if (nome) {
            campos.push("Nome = ?");
            valores.push(nome);
        }
        if (serie) {
            const idSerie = yield (0, exports.garantirExistencia)("Serie", serie);
            campos.push("Id_Serie = ?");
            valores.push(idSerie);
        }
        if (anoLetivo) {
            campos.push("AnoLetivo = ?");
            valores.push(anoLetivo);
        }
        if (turno) {
            const idTurno = yield (0, exports.garantirExistencia)("Turno", turno);
            campos.push("Id_Turno = ?");
            valores.push(idTurno);
        }
        if (sala) {
            const idSala = yield (0, exports.garantirExistencia)("Sala", sala);
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
            const result = yield queryAsync(`UPDATE Turma SET ${campos.join(", ")} WHERE Id = ? AND Status = 'Ativo'`, [...valores, idTurma]);
            if (result.affectedRows === 0) {
                return res.status(400).json({ success: false, message: "Nenhuma alteração feita" });
            }
            // Retorna a turma atualizada
            const [turmaAtualizada] = yield queryAsync(`SELECT Id, Nome, AnoLetivo, Serie, Turno, Sala, CapacidadeMaxima 
       FROM Turma WHERE Id = ?`, [idTurma]);
            res.json({ success: true, message: "Turma atualizada com sucesso", data: turmaAtualizada });
        }
        catch (error) {
            console.error("Erro ao editar turma parcialmente:", error);
            res.status(500).json({
                success: false,
                message: "Erro ao editar turma",
                error: error instanceof Error ? error.message : error
            });
        }
    });
}
function excluirTurma(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: 'ID da turma é obrigatório' });
    }
    queryAsync(`
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
function obterTurmaPorId(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            // Buscar dados básicos da turma
            const turmas = yield queryAsync(`
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
            const alunos = yield queryAsync(`
      SELECT a.Id, a.Nome, a.RA, a.FotoPerfil
      FROM Aluno a
      INNER JOIN Aluno_Turma at ON at.Id_Aluno = a.Id
      WHERE at.Id_Turma = ? AND at.Status = 'Ativo'
      ORDER BY a.Nome
    `, [id]);
            // Buscar professores e disciplinas da turma
            const professores = yield queryAsync(`
      SELECT p.Id, p.Nome, p.Email, p.FotoPerfil, GROUP_CONCAT(d.Nome SEPARATOR ', ') AS Disciplinas
      FROM Professor p
      INNER JOIN Professor_Turma_Disciplina ptd ON ptd.Id_Professor = p.Id
      INNER JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
      WHERE ptd.Id_Turma = ? AND ptd.Status = 'Ativo'
      GROUP BY p.Id, p.Nome, p.Email, p.FotoPerfil
      ORDER BY p.Nome
    `, [id]);
            // Buscar disciplinas da turma
            const disciplinas = yield queryAsync(`
      SELECT d.Id, d.Nome, d.Codigo, d.CargaHoraria
      FROM Disciplina d
      INNER JOIN Turma_Disciplina td ON td.Id_Disciplina = d.Id
      WHERE td.Id_Turma = ?
      ORDER BY d.Nome
    `, [id]);
            // Montar resposta
            const resposta = Object.assign(Object.assign({}, turma), { alunos,
                professores,
                disciplinas });
            res.json({ success: true, data: resposta });
        }
        catch (error) {
            console.error('Erro ao obter turma:', error);
            res.status(500).json({ success: false, message: 'Erro ao obter turma', error: error instanceof Error ? error.message : error });
        }
    });
}
