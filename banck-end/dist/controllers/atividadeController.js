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
exports.atutalizarAtividade = exports.deletarAtividade = exports.atualizarAtividade = exports.obterNotasAtividade = exports.criarNotaAtividade = exports.criarAtividade = exports.obterAtividades = void 0;
const db_1 = __importDefault(require("../db"));
const obterAtividades = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
    SELECT 
      a.Id AS id,
      a.Titulo AS titulo,
      a.Descricao AS descricao,
      a.DataCriacao AS dataCriacao,
      a.DataEntrega AS dataEntrega,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Atividade a
    JOIN Professor p ON a.Id_Professor = p.Id
    JOIN Turma t ON a.Id_Turma = t.Id
    JOIN Disciplina d ON a.Id_Disciplina = d.Id
  `;
    try {
        const [results] = yield db_1.default.promise().query(sql);
        res.json(results);
    }
    catch (err) {
        console.error('Erro ao buscar atividades:', err);
        res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
});
exports.obterAtividades = obterAtividades;
const criarAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioAtividade, Id_Bimestre } = req.body;
    if (!Titulo || !DataCriacao || !DataEntrega || !Id_Professor || !Id_Turma || !Id_Disciplina) {
        return res.status(400).json({ error: 'Campos obrigatórios: Titulo, DataCriacao, Id_Professor, Id_Turma, Id_Disciplina' });
    }
    const sql = `
    INSERT INTO Atividade 
      (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioAtividade, Id_Bimestre)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    try {
        const [result] = yield db_1.default.promise().query(sql, [
            Titulo,
            Descricao,
            DataCriacao,
            DataEntrega,
            Id_Professor,
            Id_Turma,
            Id_Disciplina,
            EnvioAtividade,
            Id_Bimestre
        ]);
        res.status(201).json({ message: 'Atividade criada com sucesso', id: result.insertId });
    }
    catch (err) {
        console.error('Erro ao criar atividade:', err);
        res.status(500).json({ error: 'Erro ao criar atividade' });
    }
});
exports.criarAtividade = criarAtividade;
// Criar nota para uma atividade
const criarNotaAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor } = req.body;
    if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Atividade || Valor === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor' });
    }
    const sql = `
    INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor)
    VALUES (?, ?, ?, ?, ?)
  `;
    try {
        const [result] = yield db_1.default.promise().query(sql, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor]);
        res.status(201).json({ message: 'Nota criada com sucesso', id: result.insertId });
    }
    catch (err) {
        console.error('Erro ao criar nota:', err);
        res.status(500).json({ error: 'Erro ao criar nota' });
    }
});
exports.criarNotaAtividade = criarNotaAtividade;
// Obter todas as notas de uma atividade
const obterNotasAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { atividadeId } = req.params;
    const sql = `
    SELECT n.Id, n.Id_Aluno, a.Nome AS NomeAluno, n.Id_Turma, n.Id_Bimestre, n.Valor
    FROM Nota n
    JOIN Aluno a ON n.Id_Aluno = a.Id
    WHERE n.Id_Atividade = ?
  `;
    try {
        const [results] = yield db_1.default.promise().query(sql, [atividadeId]);
        res.json(results);
    }
    catch (err) {
        console.error('Erro ao buscar notas:', err);
        res.status(500).json({ error: 'Erro ao buscar notas' });
    }
});
exports.obterNotasAtividade = obterNotasAtividade;
const atualizarAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { Titulo, Descricao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina } = req.body;
    if (!Titulo || !Id_Professor || !Id_Turma || !Id_Disciplina) {
        return res.status(400).json({ error: 'Campos obrigatórios: Titulo, Id_Professor, Id_Turma, Id_Disciplina' });
    }
    const sql = `
    UPDATE Atividade
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
            return res.status(404).json({ error: 'Atividade não encontrada' });
        }
        res.json({ message: 'Atividade atualizada com sucesso' });
    }
    catch (err) {
        console.error('Erro ao atualizar atividade:', err);
        res.status(500).json({ error: 'Erro ao atualizar atividade' });
    }
});
exports.atualizarAtividade = atualizarAtividade;
const deletarAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [result] = yield db_1.default.promise().query('DELETE FROM Atividade WHERE Id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Atividade não encontrada' });
        }
        res.json({ message: 'Atividade deletada com sucesso' });
    }
    catch (err) {
        console.error('Erro ao deletar atividade:', err);
        res.status(500).json({ error: 'Erro ao deletar atividade' });
    }
});
exports.deletarAtividade = deletarAtividade;
const atutalizarAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { Titulo, Descricao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina } = req.body;
    if (!Titulo || !Id_Professor || !Id_Turma || !Id_Disciplina) {
        return res.status(400).json({ error: 'Campos obrigatórios: Titulo, Id_Professor, Id_Turma, Id_Disciplina' });
    }
    const sql = `
    UPDATE Atividade
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
            return res.status(404).json({ error: 'Atividade não encontrada' });
        }
        res.json({ message: 'Atividade atualizada com sucesso' });
    }
    catch (err) {
        console.error('Erro ao atualizar atividade:', err);
        res.status(500).json({ error: 'Erro ao atualizar atividade' });
    }
});
exports.atutalizarAtividade = atutalizarAtividade;
