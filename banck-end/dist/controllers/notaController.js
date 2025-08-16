"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarNota = exports.deletarNota = exports.atualizarNota = exports.obterNotaPorId = exports.obterNotas = exports.obterNotasPorTurma = exports.obterNotasPorProfessor = exports.obterNotasPorDisciplina = exports.obterNotasPorAluno = void 0;
const db_1 = __importDefault(require("../db"));
const obterNotasPorAluno = (req, res) => {
    const { alunoId } = req.params;
    db_1.default.query('SELECT * FROM notas WHERE alunoId = ?', [alunoId], (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar notas' });
        res.json(results);
    });
};
exports.obterNotasPorAluno = obterNotasPorAluno;
const obterNotasPorDisciplina = (req, res) => {
    const { disciplinaId } = req.params;
    db_1.default.query('SELECT * FROM notas WHERE disciplinaId = ?', [disciplinaId], (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar notas' });
        res.json(results);
    });
};
exports.obterNotasPorDisciplina = obterNotasPorDisciplina;
const obterNotasPorProfessor = (req, res) => {
    const { professorId } = req.params;
    db_1.default.query('SELECT * FROM notas WHERE professorId = ?', [professorId], (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar notas' });
        res.json(results);
    });
};
exports.obterNotasPorProfessor = obterNotasPorProfessor;
const obterNotasPorTurma = (req, res) => {
    const { turmaId } = req.params;
    db_1.default.query('SELECT * FROM notas WHERE turmaId = ?', [turmaId], (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar notas' });
        res.json(results);
    });
};
exports.obterNotasPorTurma = obterNotasPorTurma;
const obterNotas = (req, res) => {
    db_1.default.query('SELECT * FROM notas', (err, results) => {
        if (err) {
            console.error('Erro ao buscar notas:', err); // Log do erro
            return res.status(500).json({ error: 'Erro ao buscar notas' });
        }
        console.log('Notas encontradas:', results); // Log dos resultados
        res.json(results);
    });
};
exports.obterNotas = obterNotas;
const obterNotaPorId = (req, res) => {
    const { id } = req.params;
    db_1.default.query('SELECT * FROM notas WHERE id = ?', [id], (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar nota' });
        res.json(results);
    });
};
exports.obterNotaPorId = obterNotaPorId;
const atualizarNota = (req, res) => {
    const { id } = req.params;
    const { valor } = req.body;
    const selectQuery = 'SELECT valor FROM notas WHERE id = ?';
    const updateQuery = 'UPDATE notas SET valor = ? WHERE id = ?';
    db_1.default.query(selectQuery, [id], (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar nota' });
        // Cast explícito do resultado para garantir acesso a `length` e `valor`
        const rows = results;
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nota não encontrada' });
        }
        const notaAtual = rows[0].valor;
        if (valor < notaAtual) {
            return res.status(400).json({ error: 'Não é permitido diminuir a nota' });
        }
        db_1.default.query(updateQuery, [valor, id], (err) => {
            if (err)
                return res.status(500).json({ error: 'Erro ao atualizar nota' });
            res.json({ message: 'Nota atualizada com sucesso' });
        });
    });
};
exports.atualizarNota = atualizarNota;
const deletarNota = (req, res) => {
    const { id } = req.params;
    db_1.default.query('DELETE FROM notas WHERE id = ?', [id], (err) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao deletar nota' });
        res.json({ message: 'Nota deletada com sucesso' });
    });
};
exports.deletarNota = deletarNota;
const criarNota = (req, res) => {
    const { alunoId, valor, professorId } = req.body;
    db_1.default.query('INSERT INTO notas (alunoId, valor, professorId) VALUES (?, ?, ?)', [alunoId, valor, professorId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao criar nota' });
        }
        res.status(201).json({ message: 'Nota criada com sucesso' });
    });
};
exports.criarNota = criarNota;
