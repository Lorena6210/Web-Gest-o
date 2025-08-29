"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterAtividadesPorDisciplina = exports.deletarDisciplina = exports.obterDisciplinas = exports.criarDisciplina = void 0;
const db_1 = __importDefault(require("../db"));
const criarDisciplina = (req, res) => {
    const { nome } = req.body;
    db_1.default.query('INSERT INTO disciplina (nome) VALUES (?)', [nome], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao criar disciplina' });
        }
        res.status(201).json({ message: 'Disciplina criada com sucesso' });
    });
};
exports.criarDisciplina = criarDisciplina;
const obterDisciplinas = (req, res) => {
    db_1.default.query('SELECT * FROM disciplina', (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar disciplinas' });
        res.json(results);
    });
};
exports.obterDisciplinas = obterDisciplinas;
const deletarDisciplina = (req, res) => {
    const { id } = req.params;
    db_1.default.query('DELETE FROM disciplina WHERE id = ?', [id], (err) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao deletar disciplina' });
        res.json({ message: 'Disciplina deletada com sucesso' });
    });
};
exports.deletarDisciplina = deletarDisciplina;
// Obter atividades de uma disciplina específica
const obterAtividadesPorDisciplina = (req, res) => {
    const { id } = req.params;
    const sql = `
    SELECT a.Id, a.Titulo, a.Descricao, a.DataCriacao, a.DataEntrega, p.Nome AS Professor
    FROM Atividade a
    INNER JOIN Professor p ON a.Id_Professor = p.Id
    INNER JOIN Disciplina_Atividade da ON a.Id = da.Id_Atividade
    WHERE da.Id_Disciplina = ?
  `;
    db_1.default.query(sql, [id], (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar atividades da disciplina' });
        res.json(results);
    });
};
exports.obterAtividadesPorDisciplina = obterAtividadesPorDisciplina;
