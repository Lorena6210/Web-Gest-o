"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletarHistoricoMedico = exports.obterHistoricoMedico = exports.criarHistoricoMedico = void 0;
const db_1 = __importDefault(require("../db"));
const criarHistoricoMedico = (req, res) => {
    const { alunoId, descricao } = req.body;
    db_1.default.query('INSERT INTO historico_medico (alunoId, descricao) VALUES (?, ?)', [alunoId, descricao], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao criar histórico médico' });
        }
        res.status(201).json({ message: 'Histórico médico criado com sucesso' });
    });
};
exports.criarHistoricoMedico = criarHistoricoMedico;
const obterHistoricoMedico = (req, res) => {
    const { alunoId } = req.params;
    db_1.default.query('SELECT * FROM historico_medico WHERE alunoId = ?', [alunoId], (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar histórico médico' });
        res.json(results);
    });
};
exports.obterHistoricoMedico = obterHistoricoMedico;
const deletarHistoricoMedico = (req, res) => {
    const { id } = req.params;
    db_1.default.query('DELETE FROM historico_medico WHERE id = ?', [id], (err) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao deletar histórico médico' });
        res.json({ message: 'Histórico médico deletado com sucesso' });
    });
};
exports.deletarHistoricoMedico = deletarHistoricoMedico;
