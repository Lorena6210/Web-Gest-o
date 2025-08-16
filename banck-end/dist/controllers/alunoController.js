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
exports.deleteAluno = exports.updateAlunoFoto = exports.activateAluno = exports.updateAluno = exports.createAluno = exports.getAlunoById = exports.getAlunos = void 0;
const db_1 = __importDefault(require("../db"));
// Funções de controle para Alunos
const getAlunos = (req, res) => {
    db_1.default.query('SELECT * FROM Aluno WHERE Status = "Ativo"', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar alunos' });
        }
        res.json(rows);
    });
};
exports.getAlunos = getAlunos;
const getAlunoById = (req, res) => {
    const { id } = req.params;
    const query = `
    SELECT * FROM Aluno 
    WHERE (RA = ? OR Nome = ? OR Id = ?) 
    AND Status = 'Ativo'
  `;
    db_1.default.query(query, [id, id, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar aluno' });
        }
        if (!Array.isArray(results) || results.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.status(200).json(results);
    });
};
exports.getAlunoById = getAlunoById;
const createAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Nome, CPF, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Status, RA } = req.body;
    // Validação dos campos obrigatórios
    if (!Nome || !CPF || !Senha || !RA) {
        return res.status(400).json({
            error: 'Campos obrigatórios faltando: Nome, CPF, Email, Senha e RA são necessários'
        });
    }
    try {
        // Inserção no banco de dados usando async/await
        const [result] = yield db_1.default.promise().query(`INSERT INTO Aluno (Nome, CPF, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Status, RA) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [Nome, CPF, Senha, Telefone, DataNascimento, Genero, FotoPerfil || null, Status || 'Ativo', RA]);
        res.status(201).json({
            message: 'Aluno cadastrado com sucesso',
            id: result.insertId // retorna o id do aluno inserido
        });
    }
    catch (error) {
        console.error('Erro ao cadastrar aluno:', error);
        if (typeof error === 'object' &&
            error !== null &&
            'sqlState' in error &&
            error.sqlState === '23000') {
            return res.status(409).json({
                error: 'CPF ou Email já cadastrado para outro aluno'
            });
        }
        return res.status(500).json({ error: 'Erro ao cadastrar aluno' });
    }
});
exports.createAluno = createAluno;
const updateAluno = (req, res) => {
    const { id } = req.params;
    const { Nome, Telefone, RA } = req.body;
    console.log('Dados recebidos:', { id, Nome, Telefone, RA });
    db_1.default.query('UPDATE Aluno SET Nome = ?, Telefone = ?, RA = ? WHERE Id = ?', [Nome, Telefone, RA, id], (err, result) => {
        if (err) {
            console.error('Erro MySQL:', err);
            return res.status(500).json({ error: 'Erro ao atualizar aluno', details: err.message });
        }
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json({ message: 'Aluno atualizado com sucesso' });
    });
};
exports.updateAluno = updateAluno;
const activateAluno = (req, res) => {
    const { id } = req.params;
    db_1.default.query('UPDATE Aluno SET Status = "Ativo" WHERE Id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao ativar aluno' });
        }
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado ou já está ativo' });
        }
        res.json({ message: 'Aluno ativado com sucesso' });
    });
};
exports.activateAluno = activateAluno;
const updateAlunoFoto = (req, res) => {
    const { id } = req.params;
    const { FotoPerfil } = req.body;
    db_1.default.query('UPDATE Aluno SET FotoPerfil = ? WHERE (Id = ? OR Nome = ?) = ?', [FotoPerfil, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao atualizar foto do aluno' });
        }
        res.json({ message: 'Foto atualizada com sucesso' });
    });
};
exports.updateAlunoFoto = updateAlunoFoto;
const deleteAluno = (req, res) => {
    const { id } = req.params;
    db_1.default.query('UPDATE Aluno SET Status = "Inativo" WHERE Id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao desativar aluno' });
        }
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json({ message: 'Aluno desativado com sucesso' });
    });
};
exports.deleteAluno = deleteAluno;
