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
exports.listarGradesCurriculares = exports.listarDisciplinasDaGrade = exports.deletarGradeCurricular = exports.atualizarGradeCurricular = exports.removerDisciplinaDaGrade = exports.criarGradeCurricular = exports.criarDisciplinaNaGrade = exports.listarDisciplinasPorTurmaEProfessor = void 0;
const db_1 = __importDefault(require("../db"));
// 🔹 Listar disciplinas de uma turma por professor
const listarDisciplinasPorTurmaEProfessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idTurma, idProfessor } = req.params;
    if (!idTurma || !idProfessor) {
        return res.status(400).json({ error: 'idTurma e idProfessor são obrigatórios' });
    }
    try {
        const sql = `
      SELECT 
        t.Id AS Id_Turma,
        d.Id AS Id_Disciplina,
        d.Codigo AS Codigo_Disciplina,
        d.Nome AS Nome_Disciplina,
        p.Id AS Id_Professor,
        p.Nome AS Nome_Professor,
        gd.Semestre,
        gd.CargaHoraria,
        gd.Descricao,
        gd.Obrigatoria,
        gd.Ordem
      FROM Turma t
      JOIN GradeDisciplina gd ON gd.Id_GradeCurricular = t.Id_GradeCurricular
      JOIN Disciplina d ON gd.Id_Disciplina = d.Id
      JOIN Professor_Turma_Disciplina ptd 
        ON ptd.Id_Turma = t.Id 
       AND ptd.Id_Disciplina = d.Id
      JOIN Professor p ON ptd.Id_Professor = p.Id
      WHERE t.Id = ? AND p.Id = ?
      ORDER BY gd.Semestre, gd.Ordem, d.Nome;
    `;
        const [rows] = yield db_1.default.promise().query(sql, [idTurma, idProfessor]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nenhuma disciplina encontrada para essa turma e professor' });
        }
        res.json(rows);
    }
    catch (error) {
        console.error('Erro ao listar disciplinas por turma e professor:', error);
        res.status(500).json({ error: 'Erro ao listar disciplinas por turma e professor' });
    }
});
exports.listarDisciplinasPorTurmaEProfessor = listarDisciplinasPorTurmaEProfessor;
// 🔹 Criar disciplina na grade
const criarDisciplinaNaGrade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idTurma, idProfessor, idDisciplina, semestre, cargaHoraria, obrigatoria = true, ordem, descricao } = req.body;
    if (!idTurma || !idProfessor || !idDisciplina || !semestre || !cargaHoraria) {
        return res.status(400).json({ error: 'idTurma, idProfessor, idDisciplina, semestre e cargaHoraria são obrigatórios' });
    }
    try {
        // 1. Buscar a grade da turma
        const [turmaRows] = yield db_1.default.promise().query('SELECT Id_GradeCurricular FROM Turma WHERE Id = ?', [idTurma]);
        if (turmaRows.length === 0) {
            return res.status(400).json({ error: 'Turma não encontrada ou sem grade curricular associada' });
        }
        const idGradeCurricular = turmaRows[0].Id_GradeCurricular;
        // 2. Inserir na GradeDisciplina se não existir
        const [existingGradeDisciplina] = yield db_1.default.promise().query('SELECT Id FROM GradeDisciplina WHERE Id_GradeCurricular = ? AND Id_Disciplina = ?', [idGradeCurricular, idDisciplina]);
        if (existingGradeDisciplina.length === 0) {
            yield db_1.default.promise().query(`INSERT INTO GradeDisciplina 
          (Id_GradeCurricular, Id_Disciplina, Obrigatoria, CargaHoraria, Semestre, Ordem, Descricao) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [idGradeCurricular, idDisciplina, obrigatoria, cargaHoraria, semestre, ordem || null, descricao || null]);
        }
        // 3. Inserir vínculo Professor_Turma_Disciplina
        const [existingPTD] = yield db_1.default.promise().query('SELECT Id FROM Professor_Turma_Disciplina WHERE Id_Professor = ? AND Id_Turma = ? AND Id_Disciplina = ?', [idProfessor, idTurma, idDisciplina]);
        if (existingPTD.length > 0) {
            return res.status(400).json({ error: 'Essa disciplina já está vinculada a esse professor e turma' });
        }
        const [insertResult] = yield db_1.default.promise().query(`INSERT INTO Professor_Turma_Disciplina 
        (Id_Professor, Id_Turma, Id_Disciplina, Status, DataInicio) 
       VALUES (?, ?, ?, 'Ativo', CURDATE())`, [idProfessor, idTurma, idDisciplina]);
        res.status(201).json({ message: 'Disciplina vinculada com sucesso', id: insertResult.insertId });
    }
    catch (error) {
        console.error('Erro ao criar disciplina na grade:', error);
        res.status(500).json({ error: 'Erro ao criar disciplina na grade' });
    }
});
exports.criarDisciplinaNaGrade = criarDisciplinaNaGrade;
// 🔹 Criar grade curricular
const criarGradeCurricular = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id_Curso, AnoInicio, AnoFim, Descricao } = req.body;
    if (!Id_Curso || !AnoInicio) {
        return res.status(400).json({ error: 'Id_Curso e AnoInicio são obrigatórios' });
    }
    try {
        const sql = `
      INSERT INTO GradeCurricular (Id_Curso, AnoInicio, AnoFim, Descricao)
      VALUES (?, ?, ?, ?)
    `;
        const [result] = yield db_1.default.promise().query(sql, [Id_Curso, AnoInicio, AnoFim || null, Descricao || null]);
        res.status(201).json({ message: 'Grade curricular criada com sucesso', id: result.insertId });
    }
    catch (error) {
        console.error('Erro ao criar grade curricular:', error);
        res.status(500).json({ error: 'Erro ao criar grade curricular' });
    }
});
exports.criarGradeCurricular = criarGradeCurricular;
// 🔹 Remover disciplina da grade
const removerDisciplinaDaGrade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM GradeDisciplina WHERE Id = ?';
        const [result] = yield db_1.default.promise().query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Disciplina da grade não encontrada' });
        }
        res.json({ message: 'Disciplina removida da grade com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover disciplina da grade:', error);
        res.status(500).json({ error: 'Erro ao remover disciplina da grade' });
    }
});
exports.removerDisciplinaDaGrade = removerDisciplinaDaGrade;
// 🔹 Atualizar grade curricular
const atualizarGradeCurricular = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { Id_Curso, AnoInicio, AnoFim, Descricao } = req.body;
    if (!Id_Curso || !AnoInicio) {
        return res.status(400).json({ error: 'Id_Curso e AnoInicio são obrigatórios' });
    }
    try {
        const sql = `
      UPDATE GradeCurricular
      SET Id_Curso = ?, AnoInicio = ?, AnoFim = ?, Descricao = ?
      WHERE Id = ?
    `;
        const [result] = yield db_1.default.promise().query(sql, [Id_Curso, AnoInicio, AnoFim || null, Descricao || null, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Grade curricular não encontrada' });
        }
        res.json({ message: 'Grade curricular atualizada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao atualizar grade curricular:', error);
        res.status(500).json({ error: 'Erro ao atualizar grade curricular' });
    }
});
exports.atualizarGradeCurricular = atualizarGradeCurricular;
// 🔹 Deletar grade curricular
const deletarGradeCurricular = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM GradeCurricular WHERE Id = ?';
        const [result] = yield db_1.default.promise().query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Grade curricular não encontrada' });
        }
        res.json({ message: 'Grade curricular deletada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar grade curricular:', error);
        res.status(500).json({ error: 'Erro ao deletar grade curricular' });
    }
});
exports.deletarGradeCurricular = deletarGradeCurricular;
// 🔹 Listar disciplinas da grade
const listarDisciplinasDaGrade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const sql = `
      SELECT 
        gd.Id, 
        d.Nome AS Nome_Disciplina, 
        gd.Semestre, 
        gd.CargaHoraria, 
        gd.Creditos,
        gd.Obrigatoria,
        gd.Ordem
      FROM GradeDisciplina gd
      JOIN Disciplina d ON gd.Id_Disciplina = d.Id
      WHERE gd.Id_GradeCurricular = ?
      ORDER BY gd.Semestre, gd.Ordem
    `;
        const [rows] = yield db_1.default.promise().query(sql, [id]);
        res.json(rows);
    }
    catch (error) {
        console.error('Erro ao listar disciplinas da grade:', error);
        res.status(500).json({ error: 'Erro ao listar disciplinas da grade' });
    }
});
exports.listarDisciplinasDaGrade = listarDisciplinasDaGrade;
// 🔹 Listar todas as grades curriculares
const listarGradesCurriculares = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.promise().query('SELECT * FROM GradeCurricular');
        res.json(rows);
    }
    catch (error) {
        console.error('Erro ao listar grades curriculares:', error);
        res.status(500).json({ error: 'Erro ao listar grades curriculares' });
    }
});
exports.listarGradesCurriculares = listarGradesCurriculares;
