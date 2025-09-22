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
exports.atualizarNotaAtividade = exports.deletarAtividade = exports.atualizarAtividade = exports.obterNotasAtividade = exports.criarNotaAtividade = exports.criarAtividade = exports.obterAtividades = void 0;
const db_1 = __importDefault(require("../db"));
const boletimController_1 = require("./boletimController"); // Ajuste o caminho conforme sua estrutura (importe do módulo anterior)
// GET - Obter atividades (com filtro por bimestre opcional via ?bimestre=1)
const obterAtividades = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idBimestre = req.query.bimestre ? Number(req.query.bimestre) : null;
    let sql = `
    SELECT 
      a.Id AS id,
      a.Titulo AS titulo,
      a.Descricao AS descricao,
      a.DataCriacao AS dataCriacao,
      a.DataEntrega AS dataEntrega,
      a.Id_Bimestre AS idBimestre,
      b.Nome AS nomeBimestre,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Atividade a
    JOIN Professor p ON a.Id_Professor = p.Id
    JOIN Turma t ON a.Id_Turma = t.Id
    JOIN Disciplina d ON a.Id_Disciplina = d.Id
    JOIN Bimestre b ON a.Id_Bimestre = b.Id
  `;
    const params = [];
    if (idBimestre) {
        sql += ` WHERE a.Id_Bimestre = ?`;
        params.push(idBimestre);
    }
    sql += ` ORDER BY a.DataEntrega DESC`; // Ordenar por data de entrega
    try {
        const [results] = yield db_1.default.promise().query(sql, params);
        res.json({
            atividades: results,
            filtroBimestre: idBimestre || 'Todos os bimestres'
        });
    }
    catch (err) {
        console.error('Erro ao buscar atividades:', err);
        res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
});
exports.obterAtividades = obterAtividades;
// POST - Criar atividade (Id_Bimestre obrigatório)
const criarAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioAtividade, Id_Bimestre } = req.body;
    if (!Titulo || !DataCriacao || !DataEntrega || !Id_Professor || !Id_Turma || !Id_Disciplina || !Id_Bimestre) {
        return res.status(400).json({ error: 'Campos obrigatórios: Titulo, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, Id_Bimestre' });
    }
    try {
        // Verificar se o bimestre existe
        const [bimestreRows] = yield db_1.default.promise().query(`SELECT Id FROM Bimestre WHERE Id = ?`, [Id_Bimestre]);
        if (bimestreRows.length === 0) {
            return res.status(400).json({ error: 'Bimestre não encontrado' });
        }
        const sql = `
      INSERT INTO Atividade 
        (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioAtividade, Id_Bimestre)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const [result] = yield db_1.default.promise().query(sql, [
            Titulo,
            Descricao || null,
            DataCriacao,
            DataEntrega,
            Id_Professor,
            Id_Turma,
            Id_Disciplina,
            EnvioAtividade || null,
            Id_Bimestre
        ]);
        // Opcional: Atualizar boletim se necessário (ex: para turma/disciplina)
        // await atualizarBoletim(/* passe Id_Aluno se aplicável, ou remova */);
        res.status(201).json({ message: 'Atividade criada com sucesso no bimestre informado', id: result.insertId, idBimestre: Id_Bimestre });
    }
    catch (err) {
        console.error('Erro ao criar atividade:', err);
        res.status(500).json({ error: 'Erro ao criar atividade' });
    }
});
exports.criarAtividade = criarAtividade;
// POST - Criar nota para uma atividade (com verificação de bimestre)
const criarNotaAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor } = req.body;
    if (!Id_Aluno || !Id_Turma || !Id_Bimestre || !Id_Atividade || Valor === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios: Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor' });
    }
    try {
        // Verificar se a atividade pertence ao bimestre
        const [atividadeRows] = yield db_1.default.promise().query(`
      SELECT Id_Disciplina FROM Atividade WHERE Id = ? AND Id_Bimestre = ?
    `, [Id_Atividade, Id_Bimestre]);
        if (atividadeRows.length === 0) {
            return res.status(400).json({ error: 'Atividade não encontrada para o bimestre informado' });
        }
        const idDisciplina = atividadeRows[0].Id_Disciplina;
        const sql = `
      INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor)
      VALUES (?, ?, ?, ?, ?)
    `;
        const [result] = yield db_1.default.promise().query(sql, [Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor]);
        // Atualizar boletim por bimestre
        yield (0, boletimController_1.atualizarBoletim)(Id_Aluno, idDisciplina, Id_Bimestre);
        res.status(201).json({ message: 'Nota criada com sucesso no bimestre informado', id: result.insertId, idBimestre: Id_Bimestre });
    }
    catch (err) {
        console.error('Erro ao criar nota:', err);
        res.status(500).json({ error: 'Erro ao criar nota' });
    }
});
exports.criarNotaAtividade = criarNotaAtividade;
// GET - Obter todas as notas de uma atividade (com filtro por bimestre opcional via ?bimestre=1)
const obterNotasAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { atividadeId } = req.params;
    const idBimestre = req.query.bimestre ? Number(req.query.bimestre) : null;
    let sql = `
    SELECT n.Id, n.Id_Aluno, a.Nome AS NomeAluno, n.Id_Turma, n.Id_Bimestre, n.Valor, b.Nome AS NomeBimestre
    FROM Nota n
    JOIN Aluno a ON n.Id_Aluno = a.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    WHERE n.Id_Atividade = ?
  `;
    const params = [atividadeId];
    if (idBimestre) {
        sql += ` AND n.Id_Bimestre = ?`;
        params.push(idBimestre);
    }
    sql += ` ORDER BY n.Id_Bimestre, a.Nome`; // Ordenar por bimestre e nome do aluno
    try {
        const [results] = yield db_1.default.promise().query(sql, params);
        res.json({
            notas: results,
            filtroBimestre: idBimestre || 'Todos os bimestres'
        });
    }
    catch (err) {
        console.error('Erro ao buscar notas:', err);
        res.status(500).json({ error: 'Erro ao buscar notas' });
    }
});
exports.obterNotasAtividade = obterNotasAtividade;
// PUT - Atualizar atividade (suporte a Id_Bimestre opcional)
const atualizarAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { Titulo, Descricao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, Id_Bimestre } = req.body;
    if (!Titulo || !Id_Professor || !Id_Turma || !Id_Disciplina) {
        return res.status(400).json({ error: 'Campos obrigatórios: Titulo, Id_Professor, Id_Turma, Id_Disciplina' });
    }
    // Se Id_Bimestre fornecido, validar existência
    if (Id_Bimestre) {
        const [bimestreRows] = yield db_1.default.promise().query(`SELECT Id FROM Bimestre WHERE Id = ?`, [Id_Bimestre]);
        if (bimestreRows.length === 0) {
            return res.status(400).json({ error: 'Bimestre não encontrado' });
        }
    }
    let sql = `
    UPDATE Atividade
    SET Titulo = ?, Descricao = ?, DataEntrega = ?, Id_Professor = ?, Id_Turma = ?, Id_Disciplina = ?
  `;
    const params = [
        Titulo,
        Descricao || null,
        DataEntrega || null,
        Id_Professor,
        Id_Turma,
        Id_Disciplina,
        id
    ];
    if (Id_Bimestre !== undefined) {
        sql += `, Id_Bimestre = ?`;
        params.splice(params.length - 1, 0, Id_Bimestre); // Inserir antes do WHERE
        params.push(id); // Adicionar id no final
    }
    else {
        params.push(id);
    }
    sql += ` WHERE Id = ?`;
    try {
        const [result] = yield db_1.default.promise().query(sql, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Atividade não encontrada' });
        }
        // Opcional: Atualizar boletim se Id_Bimestre alterado (ex: para turma/disciplina)
        // await atualizarBoletim(/* passe Id_Aluno se aplicável, ou remova */);
        res.json({
            message: 'Atividade atualizada com sucesso',
            idBimestreAtualizado: Id_Bimestre || 'Não alterado'
        });
    }
    catch (err) {
        console.error('Erro ao atualizar atividade:', err);
        res.status(500).json({ error: 'Erro ao atualizar atividade' });
    }
});
exports.atualizarAtividade = atualizarAtividade;
// DELETE - Deletar atividade (com filtro por bimestre opcional via ?bimestre=1)
const deletarAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const idBimestre = req.query.bimestre ? Number(req.query.bimestre) : null;
    let sql = `DELETE FROM Atividade WHERE Id = ?`;
    const params = [id];
    if (idBimestre) {
        sql += ` AND Id_Bimestre = ?`;
        params.push(idBimestre);
    }
    try {
        const [result] = yield db_1.default.promise().query(sql, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Atividade não encontrada (verifique o bimestre)' });
        }
        res.json({ message: 'Atividade deletada com sucesso', idBimestre: idBimestre || 'Todos' });
    }
    catch (err) {
        console.error('Erro ao deletar atividade:', err);
        res.status(500).json({ error: 'Erro ao deletar atividade' });
    }
});
exports.deletarAtividade = deletarAtividade;
// PUT - Atualizar nota (com verificação de bimestre)
const atualizarNotaAtividade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { Valor, Id_Bimestre } = req.body;
    if (Valor === undefined || !Id_Bimestre) {
        return res.status(400).json({ error: 'Campos obrigatórios: Valor, Id_Bimestre' });
    }
    try {
        // Verificar se a nota pertence ao bimestre
        const [notaRows] = yield db_1.default.promise().query(`
      SELECT n.Id_Aluno, a.Id_Disciplina FROM Nota n
      JOIN Atividade a ON n.Id_Atividade = a.Id
      WHERE n.Id = ? AND n.Id_Bimestre = ?
    `, [id, Id_Bimestre]);
        if (notaRows.length === 0) {
            return res.status(400).json({ error: 'Nota não encontrada para o bimestre informado' });
        }
        const Id_Aluno = notaRows[0].Id_Aluno;
        const idDisciplina = notaRows[0].Id_Disciplina;
        const sql = `
      UPDATE Nota SET Valor = ? WHERE Id = ? AND Id_Bimestre = ?
    `;
        const [result] = yield db_1.default.promise().query(sql, [Valor, id, Id_Bimestre]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nota não encontrada (verifique o bimestre)' });
        }
        // Atualizar boletim por bimestre
        yield (0, boletimController_1.atualizarBoletim)(Id_Aluno, idDisciplina, Id_Bimestre);
        res.json({ message: 'Nota atualizada com sucesso no bimestre informado', idBimestre: Id_Bimestre });
    }
    catch (err) {
        console.error('Erro ao atualizar nota:', err);
        res.status(500).json({ error: 'Erro ao atualizar nota' });
    }
});
exports.atualizarNotaAtividade = atualizarNotaAtividade;
