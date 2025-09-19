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
exports.deletarNota = exports.atualizarNota = exports.criarNota = exports.obterNotasPorAluno = void 0;
const db_1 = __importDefault(require("../db"));
const obterNotasPorAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { alunoId } = req.params;
    const query = `
    SELECT n.*, a.Titulo AS atividadeTitulo, b.Nome AS bimestreNome, al.Nome AS alunoNome, d.Nome AS disciplinaNome
    FROM Nota n
    JOIN Atividade a ON n.Id_Atividade = a.Id
    JOIN Bimestre b ON a.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Disciplina d ON a.Id_Disciplina = d.Id
    WHERE n.Id_Aluno = ?
  `;
    try {
        const [result] = yield db_1.default.promise().query(query, [alunoId]);
        res.json(result);
    }
    catch (error) {
        console.error('Erro ao buscar notas por aluno:', error);
        res.status(500).json({ error: 'Erro ao buscar notas por aluno' });
    }
});
exports.obterNotasPorAluno = obterNotasPorAluno;
// Similar para obterNotasPorDisciplina, obterNotasPorProfessor, obterNotasPorTurma, obterNotas, obterNotaPorId
const criarNota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idAluno, idAtividade, valor } = req.body;
    if (!idAluno || !idAtividade || valor === undefined || valor === null) {
        return res.status(400).json({ error: 'Campos idAluno, idAtividade e valor são obrigatórios' });
    }
    try {
        const sql = 'INSERT INTO Nota (Id_Aluno, Id_Atividade, Valor) VALUES (?, ?, ?)';
        const [result] = yield db_1.default.promise().query(sql, [idAluno, idAtividade, valor]);
        res.status(201).json({ message: 'Nota criada com sucesso', insertId: result.insertId });
    }
    catch (error) {
        console.error('Erro ao criar nota:', error);
        res.status(500).json({ error: 'Erro ao criar nota' });
    }
});
exports.criarNota = criarNota;
const atualizarNota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { valor } = req.body;
    if (valor === undefined || valor === null) {
        return res.status(400).json({ error: 'Campo valor é obrigatório' });
    }
    try {
        const sql = 'UPDATE Nota SET Valor = ? WHERE Id = ?';
        const [result] = yield db_1.default.promise().query(sql, [valor, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nota não encontrada' });
        }
        res.json({ message: 'Nota atualizada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao atualizar nota:', error);
        res.status(500).json({ error: 'Erro ao atualizar nota' });
    }
});
exports.atualizarNota = atualizarNota;
const deletarNota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [result] = yield db_1.default.promise().query('DELETE FROM Nota WHERE Id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nota não encontrada' });
        }
        res.json({ message: 'Nota deletada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar nota:', error);
        res.status(500).json({ error: 'Erro ao deletar nota' });
    }
});
exports.deletarNota = deletarNota;
