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
exports.obterProvasPorTurma = exports.obterProvas = exports.deletarProva = exports.atualizarProva = exports.criarNotaProva = exports.criarProva = exports.obterNotasProva = void 0;
const db_1 = __importDefault(require("../db"));
const obterNotasProva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { provaId } = req.params;
    const sql = `
    SELECT n.Id, n.Id_Aluno, a.Nome AS NomeAluno, n.Id_Turma, n.Id_Bimestre, n.Valor
    FROM Nota n
    JOIN Aluno a ON n.Id_Aluno = a.Id
    WHERE n.Id_Prova = ?
  `;
    try {
        const [results] = yield db_1.default.promise().query(sql, [provaId]);
        res.json(results);
    }
    catch (err) {
        console.error('Erro ao buscar notas de prova:', err);
        res.status(500).json({ error: 'Erro ao buscar notas de prova' });
    }
});
exports.obterNotasProva = obterNotasProva;
const criarProva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina } = req.body;
    if (!Titulo || !DataCriacao || !Id_Professor || !Id_Turma || !Id_Disciplina) {
        return res.status(400).json({ error: 'Campos obrigatórios: Titulo, DataCriacao, Id_Professor, Id_Turma, Id_Disciplina' });
    }
    const sql = `
    INSERT INTO Prova 
      (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    try {
        const [result] = yield db_1.default.promise().query(sql, [
            Titulo,
            Descricao || null,
            DataCriacao,
            DataEntrega || null,
            Id_Professor,
            Id_Turma,
            Id_Disciplina
        ]);
        res.status(201).json({ message: 'Prova criada com sucesso', id: result.insertId });
    }
    catch (err) {
        console.error('Erro ao criar prova:', err);
        res.status(500).json({ error: 'Erro ao criar prova' });
    }
});
exports.criarProva = criarProva;
const criarNotaProva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor } = req.body;
    if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Prova || Valor === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor' });
    }
    const sql = `
    INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor)
    VALUES (?, ?, ?, ?, ?)
  `;
    try {
        const [result] = yield db_1.default.promise().query(sql, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor]);
        res.status(201).json({ message: 'Nota de prova criada com sucesso', id: result.insertId });
    }
    catch (err) {
        console.error('Erro ao criar nota de prova:', err);
        res.status(500).json({ error: 'Erro ao criar nota de prova' });
    }
});
exports.criarNotaProva = criarNotaProva;
const atualizarProva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { Titulo, Descricao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina } = req.body;
    if (!Titulo || !Id_Professor || !Id_Turma || !Id_Disciplina) {
        return res.status(400).json({ error: 'Campos obrigatórios: Titulo, Id_Professor, Id_Turma, Id_Disciplina' });
    }
    const sql = `
    UPDATE Prova
    SET Titulo = ?, Descricao = ?, DataEntrega = ?, Id_Professor = ?, Id_Turma = ?, Id_Disciplina = ?
    WHERE Id = ?
  `;
    try {
        const [result] = yield db_1.default.promise().query(sql, [
            Titulo,
            Descricao || null,
            DataEntrega || null,
            Id_Professor,
            Id_Turma,
            Id_Disciplina,
            id
        ]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Prova não encontrada' });
        }
        res.json({ message: 'Prova atualizada com sucesso' });
    }
    catch (err) {
        console.error('Erro ao atualizar prova:', err);
        res.status(500).json({ error: 'Erro ao atualizar prova' });
    }
});
exports.atualizarProva = atualizarProva;
const deletarProva = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [result] = yield db_1.default.promise().query('DELETE FROM Prova WHERE Id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Prova não encontrada' });
        }
        res.json({ message: 'Prova deletada com sucesso' });
    }
    catch (err) {
        console.error('Erro ao deletar prova:', err);
        res.status(500).json({ error: 'Erro ao deletar prova' });
    }
});
exports.deletarProva = deletarProva;
const obterProvas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { turmaId } = req.query;
    const sql = `
    SELECT 
      pr.Id AS id,
      pr.Titulo AS titulo,
      pr.Descricao AS descricao,
      pr.DataCriacao AS dataCriacao,
      pr.DataEntrega AS dataEntrega,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Prova pr
    JOIN Professor p ON pr.Id_Professor = p.Id
    JOIN Turma t ON pr.Id_Turma = t.Id
    JOIN Disciplina d ON pr.Id_Disciplina = d.Id
  `;
    const params = [];
    if (typeof turmaId === 'string') {
        params.push(Number(turmaId));
    }
    try {
        const [results] = yield db_1.default.promise().query(sql, params);
        res.json(results);
    }
    catch (err) {
        console.error("Erro ao buscar provas:", err);
        res.status(500).json({ error: "Erro ao buscar provas" });
    }
});
exports.obterProvas = obterProvas;
const obterProvasPorTurma = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { turmaId } = req.params;
    const sql = `
    SELECT 
      pr.Id AS id,
      pr.Titulo AS titulo,
      pr.Descricao AS descricao,
      pr.DataCriacao AS dataCriacao,
      pr.DataEntrega AS dataEntrega,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Prova pr
    JOIN Professor p ON pr.Id_Professor = p.Id
    JOIN Turma t ON pr.Id_Turma = t.Id
    JOIN Disciplina d ON pr.Id_Disciplina = d.Id
    WHERE pr.Id_Turma = ?
  `;
    try {
        const [results] = yield db_1.default.promise().query(sql, [turmaId]);
        res.json(results);
    }
    catch (err) {
        console.error("Erro ao buscar provas:", err);
        res.status(500).json({ error: "Erro ao buscar provas" });
    }
});
exports.obterProvasPorTurma = obterProvasPorTurma;
