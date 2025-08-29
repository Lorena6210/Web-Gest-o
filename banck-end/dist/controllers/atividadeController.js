"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responderAtividade = exports.deletarAtividade = exports.atualizarAtividade = exports.criarAtividade = exports.obterAtividades = void 0;
const db_1 = __importDefault(require("../db"));
// Obter todas as atividades com informações completas
const obterAtividades = (req, res) => {
    const sql = `
    SELECT 
      a.Id AS id,
      a.Titulo AS titulo,
      a.Descricao AS descricao,
      a.DataAtividade AS dataAtividade,
      a.DataEntrega AS dataEntrega,
      a.Valor AS valor,
      a.Tipo AS tipo,
      ptd.Id AS idProfessorTurmaDisciplina,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Atividade a
    JOIN Professor_Turma_Disciplina ptd ON a.Id_Professor_Turma_Disciplina = ptd.Id
    JOIN Professor p ON ptd.Id_Professor = p.Id
    JOIN Turma t ON ptd.Id_Turma = t.Id
    JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
  `;
    db_1.default.query(sql, (err, results) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao buscar atividades' });
        res.json(results);
    });
};
exports.obterAtividades = obterAtividades;
// Criar nova atividade
const criarAtividade = (req, res) => {
    const { Id_Professor_Turma_Disciplina, Titulo, Descricao, DataAtividade, DataEntrega, Valor, Tipo } = req.body;
    const sql = `
    INSERT INTO Atividade 
      (Id_Professor_Turma_Disciplina, Titulo, Descricao, DataAtividade, DataEntrega, Valor, Tipo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    db_1.default.query(sql, [Id_Professor_Turma_Disciplina, Titulo, Descricao, DataAtividade, DataEntrega, Valor, Tipo], (err, result) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao criar atividade' });
        res.status(201).json({ message: 'Atividade criada com sucesso', id: result.insertId });
    });
};
exports.criarAtividade = criarAtividade;
// Atualizar atividade
const atualizarAtividade = (req, res) => {
    const { id } = req.params;
    const { Titulo, Descricao, DataEntrega, Valor, Tipo } = req.body;
    const sql = `
    UPDATE Atividade
    SET Titulo = ?, Descricao = ?, DataEntrega = ?, Valor = ?, Tipo = ?
    WHERE Id = ?
  `;
    db_1.default.query(sql, [Titulo, Descricao, DataEntrega, Valor, Tipo, id], (err) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao atualizar atividade' });
        res.json({ message: 'Atividade atualizada com sucesso' });
    });
};
exports.atualizarAtividade = atualizarAtividade;
// Deletar atividade
const deletarAtividade = (req, res) => {
    const { id } = req.params;
    db_1.default.query('DELETE FROM Atividade WHERE Id = ?', [id], (err) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao deletar atividade' });
        res.json({ message: 'Atividade deletada com sucesso' });
    });
};
exports.deletarAtividade = deletarAtividade;
const responderAtividade = (req, res) => {
    const { idAtividade } = req.params;
    const { idAluno, Resposta } = req.body;
    const sql = `
    INSERT INTO Resposta_Atividade (Id_Atividade, Id_Aluno, Resposta)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE Resposta = VALUES(Resposta), DataResposta = CURRENT_TIMESTAMP
  `;
    db_1.default.query(sql, [idAtividade, idAluno, Resposta], (err) => {
        if (err)
            return res.status(500).json({ error: 'Erro ao registrar resposta' });
        res.json({ message: 'Resposta registrada com sucesso' });
    });
};
exports.responderAtividade = responderAtividade;
