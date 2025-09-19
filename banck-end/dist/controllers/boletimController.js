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
exports.getBoletimPorAluno = exports.createOrUpdateBoletim = exports.getBoletins = exports.getNotasPorAlunoDisciplinaBimestre = exports.criarOuAtualizarNotaProva = exports.criarOuAtualizarNotaAtividade = void 0;
exports.atualizarBoletim = atualizarBoletim;
const db_1 = __importDefault(require("../db"));
// Função para calcular médias somando todas as notas e dividindo pela quantidade total
function calcularMedias(idAluno, idDisciplina, idBimestre) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const [somaAtividadesRows] = yield db_1.default.promise().query(`
    SELECT IFNULL(SUM(n.Valor), 0) AS soma, COUNT(n.Valor) AS quantidade
    FROM Nota n
    JOIN Atividade a ON n.Id_Atividade = a.Id
    WHERE n.Id_Aluno = ? AND a.Id_Disciplina = ? AND a.Id_Bimestre = ?
  `, [idAluno, idDisciplina, idBimestre]);
        const [somaProvasRows] = yield db_1.default.promise().query(`
    SELECT IFNULL(SUM(n.Valor), 0) AS soma, COUNT(n.Valor) AS quantidade
    FROM Nota n
    JOIN Prova p ON n.Id_Prova = p.Id
    WHERE n.Id_Aluno = ? AND p.Id_Disciplina = ? AND p.Id_Bimestre = ?
  `, [idAluno, idDisciplina, idBimestre]);
        const somaAtividades = (_b = (_a = somaAtividadesRows[0]) === null || _a === void 0 ? void 0 : _a.soma) !== null && _b !== void 0 ? _b : 0;
        const qtdAtividades = (_d = (_c = somaAtividadesRows[0]) === null || _c === void 0 ? void 0 : _c.quantidade) !== null && _d !== void 0 ? _d : 0;
        const somaProvas = (_f = (_e = somaProvasRows[0]) === null || _e === void 0 ? void 0 : _e.soma) !== null && _f !== void 0 ? _f : 0;
        const qtdProvas = (_h = (_g = somaProvasRows[0]) === null || _g === void 0 ? void 0 : _g.quantidade) !== null && _h !== void 0 ? _h : 0;
        const somaTotal = somaAtividades + somaProvas;
        const qtdTotal = qtdAtividades + qtdProvas;
        const mediaFinal = qtdTotal > 0 ? Number((somaTotal / qtdTotal).toFixed(2)) : 0;
        return { mediaFinal };
    });
}
// Função para calcular frequência de faltas
function calcularFrequencia(idAluno, idDisciplina, idBimestre) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const [rows] = yield db_1.default.promise().query(`
    SELECT COUNT(*) AS QtdeFaltas
    FROM Falta f
    JOIN Bimestre b ON f.DataFalta BETWEEN b.DataInicio AND b.DataFim
    WHERE f.Id_Aluno = ? AND f.Id_Disciplina = ? AND b.Id = ?
  `, [idAluno, idDisciplina, idBimestre]);
        const frequencia = (_b = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.QtdeFaltas) !== null && _b !== void 0 ? _b : 0;
        return { frequencia };
    });
}
// Função ÚNICA para atualizar boletim
function atualizarBoletim(idAluno, idDisciplina, idBimestre) {
    return __awaiter(this, void 0, void 0, function* () {
        const { mediaFinal } = yield calcularMedias(idAluno, idDisciplina, idBimestre);
        const { frequencia } = yield calcularFrequencia(idAluno, idDisciplina, idBimestre);
        let situacaoFinal;
        if (mediaFinal >= 7)
            situacaoFinal = 'Aprovado';
        else if (mediaFinal >= 5)
            situacaoFinal = 'Recuperacao';
        else
            situacaoFinal = 'Reprovado';
        const sql = `
    INSERT INTO Boletim (Id_Aluno, Id_Disciplina, Id_Bimestre, MediaFinal, Situacao, Frequencia)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      MediaFinal = VALUES(MediaFinal),
      Situacao = VALUES(Situacao),
      Frequencia = VALUES(Frequencia)
  `;
        yield db_1.default.promise().query(sql, [
            idAluno,
            idDisciplina,
            idBimestre,
            mediaFinal,
            situacaoFinal,
            frequencia
        ]);
    });
}
// Criar ou atualizar nota de Atividade
const criarOuAtualizarNotaAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor } = req.body;
    if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Atividade || Valor === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor' });
    }
    try {
        // Verificar se já existe nota para esse aluno e atividade
        const [rows] = yield db_1.default.promise().query(`
      SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Atividade = ?
    `, [Id_Aluno, Id_Atividade]);
        if (rows.length > 0) {
            // Atualizar nota existente
            yield db_1.default.promise().query(`
        UPDATE Nota SET Valor = ? WHERE Id = ?
      `, [Valor, rows[0].Id]);
        }
        else {
            // Inserir nova nota
            yield db_1.default.promise().query(`
        INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor)
        VALUES (?, ?, ?, ?, ?)
      `, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor]);
        }
        // Atualizar boletim
        // Para pegar Id_Disciplina do Atividade:
        const [atividadeRows] = yield db_1.default.promise().query(`
      SELECT Id_Disciplina FROM Atividade WHERE Id = ?
    `, [Id_Atividade]);
        if (atividadeRows.length === 0) {
            return res.status(400).json({ error: 'Atividade não encontrada' });
        }
        const idDisciplina = atividadeRows[0].Id_Disciplina;
        yield atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);
        res.json({ message: 'Nota de atividade criada/atualizada com sucesso' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar/atualizar nota de atividade' });
    }
});
exports.criarOuAtualizarNotaAtividade = criarOuAtualizarNotaAtividade;
// Criar ou atualizar nota de Prova
const criarOuAtualizarNotaProva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor } = req.body;
    if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Prova || Valor === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor' });
    }
    try {
        // Verificar se já existe nota para esse aluno e prova
        const [rows] = yield db_1.default.promise().query(`
      SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Prova = ?
    `, [Id_Aluno, Id_Prova]);
        if (rows.length > 0) {
            // Atualizar nota existente
            yield db_1.default.promise().query(`
        UPDATE Nota SET Valor = ? WHERE Id = ?
      `, [Valor, rows[0].Id]);
        }
        else {
            // Inserir nova nota
            yield db_1.default.promise().query(`
        INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor)
        VALUES (?, ?, ?, ?, ?)
      `, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor]);
        }
        // Atualizar boletim
        // Para pegar Id_Disciplina do Prova:
        const [provaRows] = yield db_1.default.promise().query(`
      SELECT Id_Disciplina FROM Prova WHERE Id = ?
    `, [Id_Prova]);
        if (provaRows.length === 0) {
            return res.status(400).json({ error: 'Prova não encontrada' });
        }
        const idDisciplina = provaRows[0].Id_Disciplina;
        yield atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);
        res.json({ message: 'Nota de prova criada/atualizada com sucesso' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar/atualizar nota de prova' });
    }
});
exports.criarOuAtualizarNotaProva = criarOuAtualizarNotaProva;
const getNotasPorAlunoDisciplinaBimestre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [notasAtividades] = yield db_1.default.promise().query(sqlAtividades, [idAluno, idDisciplina, idBimestre]);
        // Notas Provas
        const sqlProvas = `
      SELECT n.Id, n.Valor, p.Titulo, p.DataEntrega
      FROM Nota n
      JOIN Prova p ON n.Id_Prova = p.Id
      WHERE n.Id_Aluno = ? AND p.Id_Disciplina = ? AND p.Id_Bimestre = ?
    `;
        const [notasProvas] = yield db_1.default.promise().query(sqlProvas, [idAluno, idDisciplina, idBimestre]);
        res.json({
            notasAtividades,
            notasProvas
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar notas detalhadas' });
    }
});
exports.getNotasPorAlunoDisciplinaBimestre = getNotasPorAlunoDisciplinaBimestre;
// GET - Todos os boletins com média final simples calculada + frequência
const getBoletins = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [rows] = yield db_1.default.promise().query(sql);
        res.json(rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar boletins' });
    }
});
exports.getBoletins = getBoletins;
// POST - Criar ou atualizar boletim com média final simples calculada
const createOrUpdateBoletim = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { Id_Aluno, Id_Disciplina, Id_Bimestre, Situacao = null, Observacoes = null } = req.body;
    if (!Id_Aluno || !Id_Disciplina || !Id_Bimestre) {
        res.status(400).json({ error: 'Id_Aluno, Id_Disciplina e Id_Bimestre são obrigatórios' });
        return;
    }
    try {
        // Média das notas de Atividades
        const [mediaAtividadesRows] = yield db_1.default.promise().query(`
      SELECT AVG(n.Valor) AS MediaAtividades
      FROM Nota n
      JOIN Atividade a ON n.Id_Atividade = a.Id
      WHERE n.Id_Aluno = ? AND a.Id_Disciplina = ? AND a.Id_Bimestre = ?
    `, [Id_Aluno, Id_Disciplina, Id_Bimestre]);
        // Média das notas de Provas
        const [mediaProvasRows] = yield db_1.default.promise().query(`
      SELECT AVG(n.Valor) AS MediaProvas
      FROM Nota n
      JOIN Prova p ON n.Id_Prova = p.Id
      WHERE n.Id_Aluno = ? AND p.Id_Disciplina = ? AND p.Id_Bimestre = ?
    `, [Id_Aluno, Id_Disciplina, Id_Bimestre]);
        const mediaAtividades = (_b = (_a = mediaAtividadesRows[0]) === null || _a === void 0 ? void 0 : _a.MediaAtividades) !== null && _b !== void 0 ? _b : 0;
        const mediaProvas = (_d = (_c = mediaProvasRows[0]) === null || _c === void 0 ? void 0 : _c.MediaProvas) !== null && _d !== void 0 ? _d : 0;
        // Média final simples (média aritmética)
        const MediaFinal = Number(((mediaAtividades + mediaProvas) / 2).toFixed(2));
        // Definir situação se não fornecida
        let situacaoFinal = Situacao;
        if (!Situacao) {
            if (MediaFinal >= 7)
                situacaoFinal = 'Aprovado';
            else if (MediaFinal >= 5)
                situacaoFinal = 'Recuperacao';
            else
                situacaoFinal = 'Reprovado';
        }
        const sql = `
      INSERT INTO Boletim (Id_Aluno, Id_Disciplina, Id_Bimestre, MediaFinal, Situacao, Observacoes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        MediaFinal = VALUES(MediaFinal),
        Situacao = VALUES(Situacao),
        Observacoes = VALUES(Observacoes)
    `;
        const [result] = yield db_1.default.promise().query(sql, [
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao inserir boletim' });
    }
});
exports.createOrUpdateBoletim = createOrUpdateBoletim;
// GET - Boletim por aluno com média final simples calculada
const getBoletimPorAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [rows] = yield db_1.default.promise().query(sql, [idAluno]);
        res.json(rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar boletim do aluno' });
    }
});
exports.getBoletimPorAluno = getBoletimPorAluno;
