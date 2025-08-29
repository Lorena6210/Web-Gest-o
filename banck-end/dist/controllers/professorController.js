"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfessor = exports.activateProfessor = exports.updateProfessorFoto = exports.updateProfessor = exports.createProfessor = exports.getProfessorById = exports.getProfessores = void 0;
const db_1 = __importDefault(require("../db"));
const getProfessores = (req, res) => {
    db_1.default.query('SELECT * FROM Professor WHERE Status = "Ativo"', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar professores' });
        }
        res.status(200).json(results);
    });
};
exports.getProfessores = getProfessores;
const getProfessorById = (req, res) => {
    const { id } = req.params;
    const queryExata = `
    SELECT * FROM Professor 
    WHERE (Id = ? OR Nome = ? OR Email = ?) 
    AND Status = 'Ativo'
  `;
    db_1.default.query(queryExata, [id, id, id], (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar professor' });
        if (Array.isArray(results) && results.length > 0) {
            return res.status(200).json(results);
        }
        // Busca aproximada por nome ou email se não encontrar exatamente
        const queryAproximada = `
      SELECT * FROM Professor 
      WHERE (Nome LIKE ? OR Email LIKE ?) 
      AND Status = 'Ativo'
    `;
        db_1.default.query(queryAproximada, [`%${id}%`, `%${id}%`], (err2, sugestoes) => {
            if (err2)
                return res.status(500).json({ error: 'Erro ao buscar professor (sugestão)' });
            if (Array.isArray(sugestoes) && sugestoes.length > 0) {
                return res.status(404).json({
                    error: 'Professor não encontrado exatamente, mas aqui estão sugestões:',
                    sugestoes
                });
            }
            res.status(404).json({ error: 'Professor não encontrado' });
        });
    });
};
exports.getProfessorById = getProfessorById;
const createProfessor = (req, res) => {
    const { Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, FormacaoAcademica, Status } = req.body;
    console.log('Dados recebidos no corpo:', req.body);
    const query = `
    INSERT INTO Professor
      (Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, FormacaoAcademica, Status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    db_1.default.query(query, [Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil || null, FormacaoAcademica || null, Status || 'Ativo'], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar professor:', err);
            if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'CPF ou Email já cadastrado' });
            }
            return res.status(500).json({ error: 'Erro ao cadastrar professor' });
        }
        const insertId = result.insertId;
        console.log('Insert realizado, ID =', insertId);
        res.status(201).json({
            message: 'Professor cadastrado com sucesso',
            id: insertId
        });
    });
};
exports.createProfessor = createProfessor;
const updateProfessor = (req, res) => {
    const { id } = req.params;
    const { Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, FormacaoAcademica, Status } = req.body;
    db_1.default.query('UPDATE Professor SET Nome = ?, CPF = ?, Email = ?, Senha = ?, Telefone = ?, DataNascimento = ?, Genero = ?, FotoPerfil = ?, FormacaoAcademica = ?, Status = ? WHERE Id = ?', [Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, FormacaoAcademica, Status, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao atualizar professor' });
        }
        res.json({ message: 'Professor atualizado com sucesso' });
    });
};
exports.updateProfessor = updateProfessor;
const updateProfessorFoto = (req, res) => {
    const { id } = req.params;
    const { FotoPerfil } = req.body;
    db_1.default.query('UPDATE Professor SET FotoPerfil = ? WHERE Id = ?', [FotoPerfil, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao atualizar foto do professor' });
        }
        res.json({ message: 'Foto atualizada com sucesso' });
    });
};
exports.updateProfessorFoto = updateProfessorFoto;
const activateProfessor = (req, res) => {
    const { id } = req.params;
    db_1.default.query('CALL Ativar_ProfessorSET Status = "Ativo" WHERE (Id = ? OR Nome = ?) ', [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao ativar professor', details: err.message });
        }
        res.json({ message: 'Professor ativado com sucesso' });
    });
};
exports.activateProfessor = activateProfessor;
const deleteProfessor = (req, res) => {
    const { id } = req.params;
    db_1.default.query('CALL Desativar_Professor(?)', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao desativar professor' });
        }
        res.json({ message: 'Professor desativado com sucesso' });
    });
};
exports.deleteProfessor = deleteProfessor;
