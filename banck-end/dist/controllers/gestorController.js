"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGestor = exports.updateGestorFoto = exports.activateGestor = exports.updateGestor = exports.createGestor = exports.getGestorById = exports.getGestores = void 0;
const db_1 = __importDefault(require("../db"));
// Funções de controle para Gestores
const getGestores = (req, res) => {
    db_1.default.query('SELECT * FROM Gestor WHERE Status = "Ativo"', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar gestores' });
        }
        res.json(rows);
    });
};
exports.getGestores = getGestores;
const getGestorById = (req, res) => {
    const { id } = req.params;
    const query = `
    SELECT * FROM Gestor
    WHERE (Id = ? OR Nome = ?)
    AND Status = "Ativo"
  `;
    db_1.default.query(query, [id, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar gestor' });
        }
        if (!Array.isArray(results) || results.length === 0) {
            return res.status(404).json({ error: 'Gestor não encontrado' });
        }
        res.status(200).json(results);
    });
};
exports.getGestorById = getGestorById;
const createGestor = (req, res) => {
    const { Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Cargo, Status } = req.body;
    db_1.default.query('INSERT INTO Gestor (Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Cargo, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Cargo, Status], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao cadastrar gestor' });
        }
        res.status(201).json({ message: 'Gestor cadastrado com sucesso' });
    });
};
exports.createGestor = createGestor;
const updateGestor = (req, res) => {
    const { id } = req.params;
    const { Nome, Telefone, Email } = req.body; // Exemplo de campos que podem ser atualizados
    db_1.default.query('UPDATE Gestor SET Nome = ?, Telefone = ?, Email = ? WHERE Id = ?', [Nome, Telefone, Email, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao atualizar gestor' });
        }
        res.json({ message: 'Gestor atualizado com sucesso' });
    });
};
exports.updateGestor = updateGestor;
const activateGestor = (req, res) => {
    const { id } = req.params;
    const query = `
    UPDATE Gestor
    SET Status = 'Ativo'
    WHERE (Id = ? OR Nome = ?) = ?
  `;
    db_1.default.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao ativar gestor' });
        }
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Gestor não encontrado ou já está ativo' });
        }
        res.json({ message: 'Gestor ativado com sucesso' });
    });
};
exports.activateGestor = activateGestor;
const updateGestorFoto = (req, res) => {
    const { id } = req.params;
    const { FotoPerfil } = req.body;
    db_1.default.query('UPDATE Gestor SET FotoPerfil = ? WHERE Id = ?', [FotoPerfil, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao atualizar foto do gestor' });
        }
        res.json({ message: 'Foto atualizada com sucesso' });
    });
};
exports.updateGestorFoto = updateGestorFoto;
const deleteGestor = (req, res) => {
    const { id } = req.params;
    db_1.default.query('UPDATE Gestor SET Status = "Inativo" WHERE Id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao desativar gestor' });
        }
        res.json({ message: 'Gestor desativado com sucesso' });
    });
};
exports.deleteGestor = deleteGestor;
