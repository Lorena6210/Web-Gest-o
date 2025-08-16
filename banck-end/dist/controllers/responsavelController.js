"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResponsavel = exports.activateResponsavel = exports.updateResponsavel = exports.createResponsavel = exports.getResponsavelById = exports.getResponsaveis = void 0;
const db_1 = __importDefault(require("../db"));
// Funções de controle para Responsáveis
const getResponsaveis = (req, res) => {
    db_1.default.query('SELECT * FROM Responsavel WHERE Status = "Ativo"', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar responsáveis' });
        }
        res.json(rows);
    });
};
exports.getResponsaveis = getResponsaveis;
const getResponsavelById = (req, res) => {
    const { id } = req.params;
    const query = `
    SELECT * FROM  Responsavel
    WHERE (Id = ? OR Nome = ?)
    AND Status = "Ativo"
  `;
    db_1.default.query(query, [id, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar gestor' });
        }
        if (!Array.isArray(results) || results.length === 0) {
            return res.status(404).json({ error: 'Responsável cadastrado com sucesso' });
        }
        res.status(200).json(results);
    });
};
exports.getResponsavelById = getResponsavelById;
const createResponsavel = (req, res) => {
    const { Nome, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Parentesco } = req.body;
    db_1.default.query('INSERT INTO Responsavel (Nome, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Parentesco) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [Nome, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Parentesco], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: `Erro ao cadastrar responsável: ${err.message}` });
        }
        res.status(201).json({ message: 'Responsável cadastrado com sucesso' });
    });
};
exports.createResponsavel = createResponsavel;
const updateResponsavel = (req, res) => {
    const { id } = req.params;
    const { Nome, Telefone, Email } = req.body; // Exemplo de campos que podem ser atualizados
    db_1.default.query('UPDATE Responsavel SET Nome = ?, Telefone = ?, Email = ? WHERE Id = ?', [Nome, Telefone, Email, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao atualizar responsável' });
        }
        res.json({ message: 'Responsável atualizado com sucesso' });
    });
};
exports.updateResponsavel = updateResponsavel;
const activateResponsavel = (req, res) => {
    const { id } = req.params;
    db_1.default.query('UPDATE Responsavel SET Status = "Ativo" WHERE (Id = ? OR Nome = ?) = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao ativar responsável' });
        }
        if (!result) {
            return res.status(404).json({ error: 'Responsável não encontrado' });
        }
        res.json({ message: 'Responsável ativado com sucesso' });
    });
};
exports.activateResponsavel = activateResponsavel;
const deleteResponsavel = (req, res) => {
    const { id } = req.params;
    db_1.default.query('UPDATE Responsavel SET Status = "Inativo" WHERE Id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao desativar responsável' });
        }
        res.json({ message: 'Responsável desativado com sucesso' });
    });
};
exports.deleteResponsavel = deleteResponsavel;
