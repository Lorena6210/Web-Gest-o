"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.atualizarAtividade = exports.deletarAtividade = exports.responderAtividade = exports.criarAtividade = exports.obterAtividades = void 0;
const db_1 = __importDefault(require("../db"));
const obterAtividades = (req, res) => {
    const sql = `
    SELECT a.id, a.titulo, a.descricao, a.resposta, a.professorId, 
           d.nome AS disciplina
    FROM atividades a
    INNER JOIN disciplinas d ON a.disciplinaId = d.id
  `;
    db_1.default.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar atividades' });
        }
        res.json(results);
    });
};
exports.obterAtividades = obterAtividades;
const criarAtividade = (req, res) => {
    const { titulo, descricao, professorId } = req.body;
    db_1.default.query('INSERT INTO atividades (titulo, descricao, professorId) VALUES (?, ?, ?)', [titulo, descricao, professorId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao criar atividade' });
        }
        res.status(201).json({ message: 'Atividade criada com sucesso' });
    });
};
exports.criarAtividade = criarAtividade;
const responderAtividade = (req, res) => {
    const { id } = req.params;
    const { resposta } = req.body;
    db_1.default.query('UPDATE atividades SET resposta = ? WHERE id = ?', [resposta, id], (err) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao responder atividade' });
        res.json({ message: 'Atividade respondida com sucesso' });
    });
};
exports.responderAtividade = responderAtividade;
const deletarAtividade = (req, res) => {
    const { id } = req.params;
    db_1.default.query('DELETE FROM atividades WHERE id = ?', [id], (err) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao deletar atividade' });
        res.json({ message: 'Atividade deletada com sucesso' });
    });
};
exports.deletarAtividade = deletarAtividade;
const atualizarAtividade = (req, res) => {
    const { id } = req.params;
    const { titulo, descricao } = req.body;
    db_1.default.query('UPDATE atividades SET titulo = ?, descricao = ? WHERE id = ?', [titulo, descricao, id], (err) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao atualizar atividade' });
        res.json({ message: 'Atividade atualizada com sucesso' });
    });
};
exports.atualizarAtividade = atualizarAtividade;
