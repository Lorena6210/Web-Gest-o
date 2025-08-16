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
exports.buscarTodos = exports.criarGestor = exports.criarResponsavel = exports.criarProfessor = exports.criarAluno = exports.buscarResponsavelPorEmail = exports.loginGestor = exports.loginProfessor = exports.login = void 0;
const db_1 = __importDefault(require("../db")); // Certifique-se de que o db está configurado corretamente
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const promise_1 = __importDefault(require("mysql2/promise")); // Usando mysql2 com promise interface
// Chave secreta para JWT
const SECRET_KEY = 'seu_segredo'; // Substitua por uma chave secreta forte
// Função de login para Aluno
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ra, senha } = req.body;
    try {
        const [alunoResults] = yield db_1.default.promise().query('SELECT * FROM Aluno WHERE RA = ?', [ra]);
        if (alunoResults.length > 0) {
            const aluno = alunoResults[0];
            const senhaCorreta = bcrypt_1.default.compareSync(senha, aluno.Senha);
            if (senhaCorreta) {
                const token = jsonwebtoken_1.default.sign({ id: aluno.Id, tipo: 'Aluno' }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({ message: 'Login bem-sucedido', token });
            }
        }
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    catch (err) {
        console.error('Erro ao fazer login:', err);
        return res.status(500).json({ error: 'Erro ao fazer login' });
    }
});
exports.login = login;
// Função de login para Professor
const loginProfessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, cpf, senha } = req.body;
    try {
        const [professorResults] = yield db_1.default.promise().query('SELECT * FROM Professor WHERE Email = ? OR CPF = ?', [email, cpf]);
        if (professorResults.length > 0) {
            const professor = professorResults[0];
            const senhaCorreta = bcrypt_1.default.compareSync(senha, professor.Senha); // Verifique a senha
            if (senhaCorreta) {
                const token = jsonwebtoken_1.default.sign({ id: professor.Id, tipo: 'Professor' }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({ message: 'Login bem-sucedido', token });
            }
        }
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    catch (err) {
        console.error('Erro ao fazer login:', err);
        return res.status(500).json({ error: 'Erro ao fazer login' });
    }
});
exports.loginProfessor = loginProfessor;
// Função de login para Gestor
const loginGestor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, senha } = req.body;
    try {
        const [gestorResults] = yield db_1.default.promise().query('SELECT * FROM Gestor WHERE Email = ?', [email]);
        if (gestorResults.length > 0) {
            const gestor = gestorResults[0];
            const senhaCorreta = bcrypt_1.default.compareSync(senha, gestor.Senha);
            if (senhaCorreta) {
                const token = jsonwebtoken_1.default.sign({ id: gestor.Id, tipo: 'Gestor' }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({ message: 'Login bem-sucedido', token });
            }
        }
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    catch (err) {
        console.error('Erro ao fazer login:', err);
        return res.status(500).json({ error: 'Erro ao fazer login' });
    }
});
exports.loginGestor = loginGestor;
// Função para buscar Responsável por Email
const buscarResponsavelPorEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email é obrigatório' });
    }
    try {
        const connection = yield promise_1.default.createConnection({
            host: 'localhost',
            user: 'admin',
            password: 'senha123',
            database: 'NovoLearnHub'
        });
        const [rows] = yield connection.execute('SELECT * FROM Responsavel WHERE Email = ? LIMIT 1', [email]);
        yield connection.end();
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Responsável não encontrado' });
        }
        const responsavelSemSenha = {
            Id: rows[0].Id,
            Nome: rows[0].Nome,
            Email: rows[0].Email,
            Telefone: rows[0].Telefone,
            Parentesco: rows[0].Parentesco,
            Status: rows[0].Status
        };
        return res.status(200).json(responsavelSemSenha);
    }
    catch (err) {
        console.error('Erro ao buscar responsável:', err);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.buscarResponsavelPorEmail = buscarResponsavelPorEmail;
// Função para criar um Aluno
const criarAluno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, ra, senha, curso } = req.body;
    if (!nome || !ra || !senha || !curso) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    try {
        const [existingAluno] = yield db_1.default.promise().query('SELECT * FROM Aluno WHERE RA = ?', [ra]);
        if (existingAluno.length > 0) {
            return res.status(409).json({ error: 'RA já está em uso' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(senha, 10);
        yield db_1.default.promise().query('INSERT INTO Aluno (Nome, RA, Senha, Curso) VALUES (?, ?, ?, ?)', [nome, ra, hashedPassword, curso]);
        return res.status(201).json({ message: 'Aluno criado com sucesso' });
    }
    catch (err) {
        console.error('Erro ao criar aluno:', err);
        return res.status(500).json({ error: 'Erro ao criar aluno' });
    }
});
exports.criarAluno = criarAluno;
// Função para criar um Professor
const criarProfessor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, email, cpf, senha } = req.body;
    if (!nome || !email || !cpf || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    try {
        const [existingProfessor] = yield db_1.default.promise().query('SELECT * FROM Professor WHERE Email = ? OR CPF = ?', [email, cpf]);
        if (existingProfessor.length > 0) {
            return res.status(409).json({ error: 'Email ou CPF já estão em uso' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(senha, 10);
        yield db_1.default.promise().query('INSERT INTO Professor (Nome, Email, CPF, Senha) VALUES (?, ?, ?, ?)', [nome, email, cpf, hashedPassword]);
        return res.status(201).json({ message: 'Professor criado com sucesso' });
    }
    catch (err) {
        console.error('Erro ao criar professor:', err);
        return res.status(500).json({ error: 'Erro ao criar professor' });
    }
});
exports.criarProfessor = criarProfessor;
// Função para criar um Responsável
const criarResponsavel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, email, senha, telefone, parentesco } = req.body;
    if (!nome || !email || !senha || !telefone || !parentesco) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    try {
        const [existingResponsavel] = yield db_1.default.promise().query('SELECT * FROM Responsavel WHERE Email = ?', [email]);
        if (existingResponsavel.length > 0) {
            return res.status(409).json({ error: 'Email já está em uso' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(senha, 10);
        yield db_1.default.promise().query('INSERT INTO Responsavel (Nome, Email, Senha, Telefone, Parentesco) VALUES (?, ?, ?, ?, ?)', [nome, email, hashedPassword, telefone, parentesco]);
        return res.status(201).json({ message: 'Responsável criado com sucesso' });
    }
    catch (err) {
        console.error('Erro ao criar responsável:', err);
        return res.status(500).json({ error: 'Erro ao criar responsável' });
    }
});
exports.criarResponsavel = criarResponsavel;
// Função para criar um Gestor
const criarGestor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, email, senha, telefone } = req.body;
    if (!nome || !email || !senha || !telefone) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    try {
        const [existingGestor] = yield db_1.default.promise().query('SELECT * FROM Gestor WHERE Email = ?', [email]);
        if (existingGestor.length > 0) {
            return res.status(409).json({ error: 'Email já está em uso' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(senha, 10);
        yield db_1.default.promise().query('INSERT INTO Gestor (Nome, Email, Senha, Telefone) VALUES (?, ?, ?, ?)', [nome, email, hashedPassword, telefone]);
        return res.status(201).json({ message: 'Gestor criado com sucesso' });
    }
    catch (err) {
        console.error('Erro ao criar gestor:', err);
        return res.status(500).json({ error: 'Erro ao criar gestor' });
    }
});
exports.criarGestor = criarGestor;
// Função para buscar todos os registros (Alunos, Professores, Responsáveis e Gestores)
const buscarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [alunos] = yield db_1.default.promise().query('SELECT * FROM Aluno');
        const [professores] = yield db_1.default.promise().query('SELECT * FROM Professor');
        const [responsaveis] = yield db_1.default.promise().query('SELECT * FROM Responsavel');
        const [gestores] = yield db_1.default.promise().query('SELECT * FROM Gestor');
        return res.status(200).json({
            alunos,
            professores,
            responsaveis,
            gestores
        });
    }
    catch (err) {
        console.error('Erro ao buscar registros:', err);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
exports.buscarTodos = buscarTodos;
