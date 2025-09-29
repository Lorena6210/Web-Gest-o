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
exports.lançarNotasEmMassa = exports.deletarNota = exports.atualizarNota = exports.criarNota = exports.obterNotasPorTurma = exports.obterNotasPorProfessor = exports.obterNotasPorDisciplina = exports.obterNotasPorAluno = exports.obterNotaPorId = exports.obterNotas = void 0;
const db_1 = __importDefault(require("../db")); // Assumindo que você tem um pool de conexões MySQL configurado
// 1. Obter todas as notas (com paginação opcional)
const obterNotas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = req.query; // Paginação simples
    const offset = (Number(page) - 1) * Number(limit);
    const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    ORDER BY n.Id DESC
    LIMIT ? OFFSET ?
  `;
    try {
        const [result] = yield db_1.default.promise().query(query, [Number(limit), offset]);
        // Contagem total para paginação
        const [countResult] = yield db_1.default.promise().query('SELECT COUNT(*) as total FROM Nota');
        const total = countResult[0]['total'];
        res.json({
            data: result,
            pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
        });
    }
    catch (error) {
        console.error('Erro ao buscar notas:', error);
        res.status(500).json({ error: 'Erro ao buscar notas' });
    }
});
exports.obterNotas = obterNotas;
// 2. Obter nota por ID
const obterNotaPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID da nota é obrigatório e deve ser um número' });
    }
    const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    WHERE n.Id = ?
  `;
    try {
        const [result] = yield db_1.default.promise().query(query, [Number(id)]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Nota não encontrada' });
        }
        res.json(result[0]);
    }
    catch (error) {
        console.error('Erro ao buscar nota por ID:', error);
        res.status(500).json({ error: 'Erro ao buscar nota por ID' });
    }
});
exports.obterNotaPorId = obterNotaPorId;
// 3. Obter notas por aluno (como no seu exemplo)
const obterNotasPorAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { alunoId } = req.params;
    if (!alunoId || isNaN(Number(alunoId))) {
        return res.status(400).json({ error: 'ID do aluno é obrigatório e deve ser um número' });
    }
    const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    WHERE n.Id_Aluno = ?
    ORDER BY b.Nome, n.Id
  `;
    try {
        const [result] = yield db_1.default.promise().query(query, [Number(alunoId)]);
        res.json(result);
    }
    catch (error) {
        console.error('Erro ao buscar notas por aluno:', error);
        res.status(500).json({ error: 'Erro ao buscar notas por aluno' });
    }
});
exports.obterNotasPorAluno = obterNotasPorAluno;
// 4. Obter notas por disciplina
const obterNotasPorDisciplina = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { disciplinaId } = req.params;
    if (!disciplinaId || isNaN(Number(disciplinaId))) {
        return res.status(400).json({ error: 'ID da disciplina é obrigatório e deve ser um número' });
    }
    const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    WHERE d.Id = ?
    ORDER BY al.Nome, b.Nome
  `;
    try {
        const [result] = yield db_1.default.promise().query(query, [Number(disciplinaId)]);
        res.json(result);
    }
    catch (error) {
        console.error('Erro ao buscar notas por disciplina:', error);
        res.status(500).json({ error: 'Erro ao buscar notas por disciplina' });
    }
});
exports.obterNotasPorDisciplina = obterNotasPorDisciplina;
// 5. Obter notas por professor (baseado em atividades/provas atribuídas ao professor)
const obterNotasPorProfessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { professorId } = req.params;
    if (!professorId || isNaN(Number(professorId))) {
        return res.status(400).json({ error: 'ID do professor é obrigatório e deve ser um número' });
    }
    const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova pr ON n.Id_Prova = pr.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR pr.Id_Disciplina = d.Id)
    WHERE (a.Id_Professor = ? OR pr.Id_Professor = ?)
    ORDER BY d.Nome, al.Nome
  `;
    try {
        const [result] = yield db_1.default.promise().query(query, [Number(professorId), Number(professorId)]);
        res.json(result);
    }
    catch (error) {
        console.error('Erro ao buscar notas por professor:', error);
        res.status(500).json({ error: 'Erro ao buscar notas por professor' });
    }
});
exports.obterNotasPorProfessor = obterNotasPorProfessor;
// 6. Obter notas por turma
const obterNotasPorTurma = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { turmaId } = req.params;
    if (!turmaId || isNaN(Number(turmaId))) {
        return res.status(400).json({ error: 'ID da turma é obrigatório e deve ser um número' });
    }
    const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    WHERE n.Id_Turma = ?
    ORDER BY al.Nome, b.Nome
  `;
    try {
        const [result] = yield db_1.default.promise().query(query, [Number(turmaId)]);
        res.json(result);
    }
    catch (error) {
        console.error('Erro ao buscar notas por turma:', error);
        res.status(500).json({ error: 'Erro ao buscar notas por turma' });
    }
});
exports.obterNotasPorTurma = obterNotasPorTurma;
// 7. Criar nota (suporta atividade ou prova)
const criarNota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idAluno, idTurma, idBimestre, idAtividade, idProva, valor } = req.body;
    if (!idAluno || !idTurma || !idBimestre || (!idAtividade && !idProva) || valor === undefined || valor === null) {
        return res.status(400).json({ error: 'Campos idAluno, idTurma, idBimestre, (idAtividade OU idProva) e valor são obrigatórios' });
    }
    if (valor < 0 || valor > 10) { // Assumindo escala 0-10
        return res.status(400).json({ error: 'Valor deve estar entre 0 e 10' });
    }
    try {
        // Verifica se já existe uma nota para essa combinação (evita duplicatas)
        const checkQuery = `
      SELECT Id FROM Nota 
      WHERE Id_Aluno = ? AND Id_Turma = ? AND Id_Bimestre = ? 
      AND (Id_Atividade = ? OR Id_Prova = ?) 
      AND (Id_Atividade IS NOT NULL OR Id_Prova IS NOT NULL)
    `;
        const [checkResult] = yield db_1.default.promise().query(checkQuery, [idAluno, idTurma, idBimestre, idAtividade || null, idProva || null]);
        if (checkResult.length > 0) {
            return res.status(409).json({ error: 'Nota já existe para essa combinação de aluno, turma, bimestre e avaliação' });
        }
        const sql = `
      INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Id_Prova, Valor) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const [result] = yield db_1.default.promise().query(sql, [idAluno, idTurma, idBimestre, idAtividade || null, idProva || null, valor]);
        res.status(201).json({ message: 'Nota criada com sucesso', insertId: result.insertId });
    }
    catch (error) {
        console.error('Erro ao criar nota:', error);
        res.status(500).json({ error: 'Erro ao criar nota' });
    }
});
exports.criarNota = criarNota;
// 8. Atualizar nota (como no seu exemplo)
const atualizarNota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { valor } = req.body;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID da nota é obrigatório e deve ser um número' });
    }
    if (valor === undefined || valor === null || valor < 0 || valor > 10) {
        return res.status(400).json({ error: 'Campo valor é obrigatório e deve estar entre 0 e 10' });
    }
    try {
        const sql = 'UPDATE Nota SET Valor = ? WHERE Id = ?';
        const [result] = yield db_1.default.promise().query(sql, [valor, Number(id)]);
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
// 9. Deletar nota (como no seu exemplo)
const deletarNota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID da nota é obrigatório e deve ser um número' });
    }
    try {
        const [result] = yield db_1.default.promise().query('DELETE FROM Nota WHERE Id = ?', [Number(id)]);
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
// Função sem transações: Usa pool.promise().query() para cada operação
const lançarNotasEmMassa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { avaliacoes, notas } = req.body;
    // Validações (mesmas de antes)
    if (!avaliacoes || !Array.isArray(avaliacoes) || avaliacoes.length === 0) {
        return res.status(400).json({ error: 'Campo "avaliacoes" obrigatório' });
    }
    if (!notas || !Array.isArray(notas) || notas.length === 0) {
        return res.status(400).json({ error: 'Campo "notas" obrigatório' });
    }
    const notasInseridas = [];
    let totalInseridas = 0;
    let totalDuplicadas = 0;
    try {
        for (const avaliacao of avaliacoes) {
            const { tipo, id: idAvaliacao } = avaliacao;
            if (!tipo || !['atividade', 'prova'].includes(tipo) || !idAvaliacao) {
                return res.status(400).json({ error: 'Avaliação inválida' });
            }
            // Valida avaliação no BD
            let avaliacaoQuery;
            if (tipo === 'atividade') {
                avaliacaoQuery = `SELECT a.Id AS idAvaliacao, a.Id_Turma, a.Id_Disciplina, a.Id_Bimestre, d.Nome AS disciplinaNome FROM Atividade a JOIN Disciplina d ON a.Id_Disciplina = d.Id JOIN Turma t ON a.Id_Turma = t.Id WHERE a.Id = ?`;
            }
            else {
                avaliacaoQuery = `SELECT pr.Id AS idAvaliacao, pr.Id_Turma, pr.Id_Disciplina, pr.Id_Bimestre, d.Nome AS disciplinaNome FROM Prova pr JOIN Disciplina d ON pr.Id_Disciplina = d.Id JOIN Turma t ON pr.Id_Turma = t.Id WHERE pr.Id = ?`;
            }
            const [avaliacaoResult] = yield db_1.default.promise().query(avaliacaoQuery, [Number(idAvaliacao)]);
            if (avaliacaoResult.length === 0) {
                return res.status(400).json({ error: `${tipo} não encontrada` });
            }
            const avaliacaoDb = avaliacaoResult[0];
            const idTurma = avaliacaoDb.idAvaliacao; // Ajuste os nomes se necessário
            const idDisciplina = avaliacaoDb.Id_Disciplina;
            const idBimestre = avaliacaoDb.Id_Bimestre;
            // Filtra e processa notas (similar à opção 1, mas com pool.promise().query())
            const notasParaAvaliacao = notas.filter((n) => n.tipo === tipo && n.idAvaliacao === Number(idAvaliacao));
            for (const notaInput of notasParaAvaliacao) {
                const { alunoId, valor } = notaInput;
                // Valida aluno (usando pool.promise())
                const [alunoResult] = yield db_1.default.promise().query(`SELECT 1 FROM Aluno_Turma WHERE Id_Aluno = ? AND Id_Turma = ? AND Status = 'Ativo'`, [Number(alunoId), idTurma]);
                if (alunoResult.length === 0) {
                    totalDuplicadas++;
                    continue;
                }
                // Verifica duplicata
                const campo = tipo === 'atividade' ? 'Id_Atividade' : 'Id_Prova';
                const [duplicataResult] = yield db_1.default.promise().query(`SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Turma = ? AND Id_Bimestre = ? AND ${campo} = ?`, [Number(alunoId), idTurma, idBimestre, Number(idAvaliacao)]);
                if (duplicataResult.length > 0) {
                    totalDuplicadas++;
                    continue;
                }
                // Insere (sem transação)
                const [insertResult] = yield db_1.default.promise().query(`INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, ${campo}, Valor) VALUES (?, ?, ?, ?, ?)`, [Number(alunoId), idTurma, idBimestre, Number(idAvaliacao), Number(valor)]);
                notasInseridas.push(Object.assign(Object.assign({}, notaInput), { idTurma, idDisciplina, idBimestre, id: insertResult.insertId }));
                totalInseridas++;
                // Atualiza boletim
                yield db_1.default.promise().query(`CALL CalcularMediaBoletim(?, ?, ?)`, [Number(alunoId), idDisciplina, idBimestre]);
            }
        }
        res.status(201).json({
            message: `Sucesso! ${totalInseridas} notas inseridas.`,
            resumo: { totalInseridas, totalDuplicadasOuInvalidas: totalDuplicadas },
            notasInseridas
        });
    }
    catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro ao inserir notas' });
    }
});
exports.lançarNotasEmMassa = lançarNotasEmMassa;
