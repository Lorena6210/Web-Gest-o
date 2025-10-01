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
exports.getBoletimPorAlunoEDisciplina = exports.getBoletins = exports.getNotasPorAlunoDisciplinaBimestre = exports.criarOuAtualizarNotaProva = exports.criarOuAtualizarNotaAtividade = void 0;
exports.atualizarBoletim = atualizarBoletim;
const db_1 = __importDefault(require("../db"));
// Função para calcular médias somando todas as notas e dividindo pela quantidade total (por bimestre)
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
// Função para calcular frequência de faltas (por bimestre)
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
// Função ÚNICA para atualizar boletim (por bimestre, com observações opcionais)
function atualizarBoletim(idAluno, idDisciplina, idBimestre, observacoes) {
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
    INSERT INTO Boletim (Id_Aluno, Id_Disciplina, Id_Bimestre, MediaFinal, Situacao, Frequencia, Observacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      MediaFinal = VALUES(MediaFinal),
      Situacao = VALUES(Situacao),
      Frequencia = VALUES(Frequencia),
      Observacoes = VALUES(Observacoes)
  `;
        yield db_1.default.promise().query(sql, [
            idAluno,
            idDisciplina,
            idBimestre,
            mediaFinal,
            situacaoFinal,
            frequencia,
            observacoes || null
        ]);
    });
}
// POST - Criar ou atualizar nota de Atividade (com bimestre obrigatório)
const criarOuAtualizarNotaAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor } = req.body;
    if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Atividade || Valor === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor' });
    }
    try {
        // Verificar se já existe nota para esse aluno e atividade (por bimestre implícito via Nota)
        const [rows] = yield db_1.default.promise().query(`
      SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Atividade = ? AND Id_Bimestre = ?
    `, [Id_Aluno, Id_Atividade, Id_Bimestre]);
        if (rows.length > 0) {
            // Atualizar nota existente
            yield db_1.default.promise().query(`
        UPDATE Nota SET Valor = ? WHERE Id = ?
      `, [Valor, rows[0].Id]);
        }
        else {
            // Inserir nova nota (com bimestre)
            yield db_1.default.promise().query(`
        INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor)
        VALUES (?, ?, ?, ?, ?)
      `, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor]);
        }
        // Pegar Id_Disciplina da Atividade (com verificação de bimestre)
        const [atividadeRows] = yield db_1.default.promise().query(`
      SELECT Id_Disciplina FROM Atividade WHERE Id = ? AND Id_Bimestre = ?
    `, [Id_Atividade, Id_Bimestre]);
        if (atividadeRows.length === 0) {
            return res.status(400).json({ error: 'Atividade não encontrada para o bimestre informado' });
        }
        const idDisciplina = atividadeRows[0].Id_Disciplina;
        // Atualizar boletim (por bimestre)
        yield atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);
        res.json({ message: 'Nota de atividade criada/atualizada com sucesso (boletim atualizado por bimestre)' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar/atualizar nota de atividade' });
    }
});
exports.criarOuAtualizarNotaAtividade = criarOuAtualizarNotaAtividade;
// POST - Criar ou atualizar nota de Prova (com bimestre obrigatório)
const criarOuAtualizarNotaProva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor } = req.body;
    if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Prova || Valor === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor' });
    }
    try {
        // Verificar se já existe nota para esse aluno e prova (por bimestre)
        const [rows] = yield db_1.default.promise().query(`
      SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Prova = ? AND Id_Bimestre = ?
    `, [Id_Aluno, Id_Prova, Id_Bimestre]);
        if (rows.length > 0) {
            // Atualizar nota existente
            yield db_1.default.promise().query(`
        UPDATE Nota SET Valor = ? WHERE Id = ?
      `, [Valor, rows[0].Id]);
        }
        else {
            // Inserir nova nota (com bimestre)
            yield db_1.default.promise().query(`
        INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor)
        VALUES (?, ?, ?, ?, ?)
      `, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor]);
        }
        // Pegar Id_Disciplina da Prova (com verificação de bimestre)
        const [provaRows] = yield db_1.default.promise().query(`
      SELECT Id_Disciplina FROM Prova WHERE Id = ? AND Id_Bimestre = ?
    `, [Id_Prova, Id_Bimestre]);
        if (provaRows.length === 0) {
            return res.status(400).json({ error: 'Prova não encontrada para o bimestre informado' });
        }
        const idDisciplina = provaRows[0].Id_Disciplina;
        // Atualizar boletim (por bimestre)
        yield atualizarBoletim(Id_Aluno, idDisciplina, Id_Bimestre);
        res.json({ message: 'Nota de prova criada/atualizada com sucesso (boletim atualizado por bimestre)' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar/atualizar nota de prova' });
    }
});
exports.criarOuAtualizarNotaProva = criarOuAtualizarNotaProva;
// GET - Notas por aluno, disciplina e bimestre (detalhado)
const getNotasPorAlunoDisciplinaBimestre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [notasAtividades] = yield db_1.default.promise().query(sqlAtividades, [idAluno, idDisciplina, idBimestre]);
        // Notas de Provas (filtrado por bimestre)
        const sqlProvas = `
      SELECT n.Id, n.Valor, p.Titulo, p.DataEntrega
      FROM Nota n
      JOIN Prova p ON n.Id_Prova = p.Id
      WHERE n.Id_Aluno = ? AND p.Id_Disciplina = ? AND p.Id_Bimestre = ?
      ORDER BY p.DataEntrega
    `;
        const [notasProvas] = yield db_1.default.promise().query(sqlProvas, [idAluno, idDisciplina, idBimestre]);
        res.json({
            idBimestre: Number(idBimestre), // Retorna o bimestre usado
            notasAtividades,
            notasProvas
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar notas detalhadas por bimestre' });
    }
});
exports.getNotasPorAlunoDisciplinaBimestre = getNotasPorAlunoDisciplinaBimestre;
// GET - Todos os boletins (com cálculos por bimestre e nome da disciplina)
const getBoletins = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sql = `
      SELECT
        b.Id_Aluno,
        b.Id_Disciplina,
        d.Nome AS NomeDisciplina,
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
      JOIN Disciplina d ON b.Id_Disciplina = d.Id
      ORDER BY b.Id_Aluno, b.Id_Disciplina, b.Id_Bimestre
    `;
        const [results] = yield db_1.default.promise().query(sql);
        res.json(results);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar boletins' });
    }
});
exports.getBoletins = getBoletins;
// GET - Boletim específico por aluno e disciplina (com cálculos por bimestre)
const getBoletimPorAlunoEDisciplina = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [results] = yield db_1.default.promise().query(sql, [idAluno, idDisciplina]);
        res.json(results);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar boletim por aluno e disciplina' });
    }
});
exports.getBoletimPorAlunoEDisciplina = getBoletimPorAlunoEDisciplina;
