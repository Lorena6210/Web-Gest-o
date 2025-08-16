"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterFaltasPorAlunoTurma = exports.obterFaltasPorAlunoDisciplina = exports.obterFaltasPorData = exports.obterFaltasPorTurma = exports.obterFaltasPorDisciplina = exports.obterFaltasPorAluno = exports.atualizarFalta = exports.getFaltas = exports.criarFalta = void 0;
const db_1 = __importDefault(require("../db"));
const criarFalta = (req, res) => {
    const { Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada } = req.body;
    // Função para garantir que existe o registro na tabela, criando se necessário
    const garantirExistencia = (table, id, nome) => {
        return new Promise((resolve, reject) => {
            db_1.default.query(`SELECT Id FROM ${table} WHERE Id = ?`, [id], (err, results) => {
                if (err)
                    return reject(err);
                if (results.length === 0) {
                    if (table === 'Aluno') {
                        // Inserir aluno com todos os campos obrigatórios preenchidos para evitar erro
                        db_1.default.query(`INSERT INTO Aluno (Id, Nome, CPF, Telefone, Senha) VALUES (?, ?, ?, ?, ?)`, [
                            id,
                            nome,
                            '00000000000', // CPF padrão
                            '00000000000', // Telefone padrão
                            'senha123' // Senha padrão (ajuste conforme seu schema)
                        ], (insertErr) => {
                            if (insertErr)
                                return reject(insertErr);
                            resolve();
                        });
                    }
                    else {
                        // Para Turma e Disciplina, inserir só Id e Nome
                        db_1.default.query(`INSERT INTO ${table} (Id, Nome) VALUES (?, ?)`, [id, nome], (insertErr) => {
                            if (insertErr)
                                return reject(insertErr);
                            resolve();
                        });
                    }
                }
                else {
                    resolve();
                }
            });
        });
    };
    Promise.all([
        garantirExistencia('Aluno', Id_Aluno, 'Aluno Criado Automaticamente'),
        garantirExistencia('Turma', Id_Turma, 'Turma Criada Automaticamente'),
        garantirExistencia('Disciplina', Id_Disciplina, 'Disciplina Criada Automaticamente'),
    ])
        .then(() => {
        db_1.default.query('INSERT INTO Falta (Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada) VALUES (?, ?, ?, ?, ?)', [Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada || false], (err) => {
            if (err) {
                console.error('Erro ao criar falta:', err);
                return res.status(500).json({ error: 'Erro ao criar falta', details: err.message });
            }
            res.status(201).json({ message: 'Falta criada com sucesso' });
        });
    })
        .catch((err) => {
        console.error('Erro ao garantir existência dos dados relacionados:', err);
        res.status(500).json({ error: 'Erro ao preparar dados para falta', details: err.message });
    });
};
exports.criarFalta = criarFalta;
// Obter todas as faltas
const getFaltas = (req, res) => {
    db_1.default.query('SELECT * FROM Falta', (err, rows) => {
        if (err) {
            console.error('Erro ao obter faltas:', err);
            return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
        }
        return res.json(rows);
    });
};
exports.getFaltas = getFaltas;
// Atualizar falta (justificar)
const atualizarFalta = (req, res) => {
    const { id } = req.params;
    const { Justificada } = req.body;
    const query = 'UPDATE Falta SET Justificada = ? WHERE Id = ?';
    db_1.default.query(query, [Justificada, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar falta:', err);
            return res.status(500).json({ error: 'Erro ao atualizar falta', detalhes: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Falta não encontrada' });
        }
        return res.json({ message: 'Falta atualizada com sucesso' });
    });
};
exports.atualizarFalta = atualizarFalta;
// Obter faltas por aluno
const obterFaltasPorAluno = (req, res) => {
    const { alunoId } = req.params;
    db_1.default.query('SELECT * FROM Falta WHERE Id_Aluno = ?', [alunoId], (err, rows) => {
        if (err) {
            console.error('Erro ao obter faltas por aluno:', err);
            return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
        }
        return res.json(rows);
    });
};
exports.obterFaltasPorAluno = obterFaltasPorAluno;
// Obter faltas por disciplina
const obterFaltasPorDisciplina = (req, res) => {
    const { disciplinaId } = req.params;
    db_1.default.query('SELECT * FROM Falta WHERE Id_Disciplina = ?', [disciplinaId], (err, rows) => {
        if (err) {
            console.error('Erro ao obter faltas por disciplina:', err);
            return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
        }
        return res.json(rows);
    });
};
exports.obterFaltasPorDisciplina = obterFaltasPorDisciplina;
// Obter faltas por turma
const obterFaltasPorTurma = (req, res) => {
    const { turmaId } = req.params;
    db_1.default.query('SELECT * FROM Falta WHERE Id_Turma = ?', [turmaId], (err, rows) => {
        if (err) {
            console.error('Erro ao obter faltas por turma:', err);
            return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
        }
        return res.json(rows);
    });
};
exports.obterFaltasPorTurma = obterFaltasPorTurma;
// Obter faltas por data
const obterFaltasPorData = (req, res) => {
    const { dataFalta } = req.params;
    db_1.default.query('SELECT * FROM Falta WHERE DataFalta = ?', [dataFalta], (err, rows) => {
        if (err) {
            console.error('Erro ao obter faltas por data:', err);
            return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
        }
        return res.json(rows);
    });
};
exports.obterFaltasPorData = obterFaltasPorData;
// Obter faltas por aluno e disciplina
const obterFaltasPorAlunoDisciplina = (req, res) => {
    const { alunoId, disciplinaId } = req.params;
    db_1.default.query('SELECT * FROM Falta WHERE Id_Aluno = ? AND Id_Disciplina = ?', [alunoId, disciplinaId], (err, rows) => {
        if (err) {
            console.error('Erro ao obter faltas por aluno e disciplina:', err);
            return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
        }
        return res.json(rows);
    });
};
exports.obterFaltasPorAlunoDisciplina = obterFaltasPorAlunoDisciplina;
// Obter faltas por aluno e turma
const obterFaltasPorAlunoTurma = (req, res) => {
    const { alunoId, turmaId } = req.params;
    db_1.default.query('SELECT * FROM Falta WHERE Id_Aluno = ? AND Id_Turma = ?', [alunoId, turmaId], (err, rows) => {
        if (err) {
            console.error('Erro ao obter faltas por aluno e turma:', err);
            return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
        }
        return res.json(rows);
    });
};
exports.obterFaltasPorAlunoTurma = obterFaltasPorAlunoTurma;
