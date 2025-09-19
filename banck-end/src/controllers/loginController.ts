import type { Request, Response } from 'express';
import db from '../db'; // Certifique-se de que o db está configurado corretamente
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise'; // Usando mysql2 com promise interface
import { RowDataPacket } from 'mysql2';

// Chave secreta para JWT
const SECRET_KEY = 'seu_segredo'; // Substitua por uma chave secreta forte

// Interface para Responsável
interface Responsavel extends RowDataPacket {
    Id: number;
    Nome: string;
    Email: string;
    Senha: string;
    Telefone: string;
    Parentesco: string;
    Status: string;
}

// Função de login para Aluno
export const login = async (req: Request, res: Response) => {
    const { ra, senha } = req.body;

    try {
        const [alunoResults] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Aluno WHERE RA = ?', [ra]);
        if (alunoResults.length > 0) {
            const aluno = alunoResults[0];
            const senhaCorreta = bcrypt.compareSync(senha, aluno.Senha);
            if (senhaCorreta) {
                const token = jwt.sign({ id: aluno.Id, tipo: 'Aluno' }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({ message: 'Login bem-sucedido', token });
            }
        }
        return res.status(401).json({ error: 'Credenciais inválidas' });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        return res.status(500).json({ error: 'Erro ao fazer login' });
    }
};


// Função de login para Professor
export const loginProfessor = async (req: Request, res: Response) => {
    const { email, cpf, senha } = req.body;

    try {
        const [professorResults] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Professor WHERE Email = ? OR CPF = ?', [email, cpf]);
        if (professorResults.length > 0) {
            const professor = professorResults[0];
            const senhaCorreta = bcrypt.compareSync(senha, professor.Senha); // Verifique a senha
            if (senhaCorreta) {
                const token = jwt.sign({ id: professor.Id, tipo: 'Professor' }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({ message: 'Login bem-sucedido', token });
            }
        }
        return res.status(401).json({ error: 'Credenciais inválidas' });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        return res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

// Função de login para Gestor
export const loginGestor = async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    try {
        const [gestorResults] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Gestor WHERE Email = ?', [email]);
        if (gestorResults.length > 0) {
            const gestor = gestorResults[0];
            const senhaCorreta = bcrypt.compareSync(senha, gestor.Senha);
            if (senhaCorreta) {
                const token = jwt.sign({ id: gestor.Id, tipo: 'Gestor' }, SECRET_KEY, { expiresIn: '1h' });
                return res.json({ message: 'Login bem-sucedido', token });
            }
        }
        return res.status(401).json({ error: 'Credenciais inválidas' });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        return res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

// Função para buscar Responsável por Email
export const buscarResponsavelPorEmail = async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email é obrigatório' });
    }

    try {
        const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'senha@123',
        database: 'ControlHub'
        });

        const [rows] = await connection.execute<Responsavel[]>(
            'SELECT * FROM Responsavel WHERE Email = ? LIMIT 1',
            [email]
        );

        await connection.end();

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

    } catch (err) {
        console.error('Erro ao buscar responsável:', err);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

// Função para criar um Aluno
export const criarAluno = async (req: Request, res: Response) => {
    const { nome, ra, senha, curso } = req.body;

    if (!nome || !ra || !senha || !curso) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const [existingAluno] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Aluno WHERE RA = ?', [ra]);
        if (existingAluno.length > 0) {
            return res.status(409).json({ error: 'RA já está em uso' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        await db.promise().query('INSERT INTO Aluno (Nome, RA, Senha, Curso) VALUES (?, ?, ?, ?)', [nome, ra, hashedPassword, curso]);

        return res.status(201).json({ message: 'Aluno criado com sucesso' });
    } catch (err) {
        console.error('Erro ao criar aluno:', err);
        return res.status(500).json({ error: 'Erro ao criar aluno' });
    }
};

// Função para criar um Professor
export const criarProfessor = async (req: Request, res: Response) => {
    const { nome, email, cpf, senha } = req.body;

    if (!nome || !email || !cpf || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const [existingProfessor] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Professor WHERE Email = ? OR CPF = ?', [email, cpf]);
        if (existingProfessor.length > 0) {
            return res.status(409).json({ error: 'Email ou CPF já estão em uso' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        await db.promise().query('INSERT INTO Professor (Nome, Email, CPF, Senha) VALUES (?, ?, ?, ?)', [nome, email, cpf, hashedPassword]);

        return res.status(201).json({ message: 'Professor criado com sucesso' });
    } catch (err) {
        console.error('Erro ao criar professor:', err);
        return res.status(500).json({ error: 'Erro ao criar professor' });
    }
};

// Função para criar um Responsável
export const criarResponsavel = async (req: Request, res: Response) => {
    const { nome, email, senha, telefone, parentesco } = req.body;

    if (!nome || !email || !senha || !telefone || !parentesco) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const [existingResponsavel] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Responsavel WHERE Email = ?', [email]);
        if (existingResponsavel.length > 0) {
            return res.status(409).json({ error: 'Email já está em uso' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        await db.promise().query('INSERT INTO Responsavel (Nome, Email, Senha, Telefone, Parentesco) VALUES (?, ?, ?, ?, ?)', [nome, email, hashedPassword, telefone, parentesco]);

        return res.status(201).json({ message: 'Responsável criado com sucesso' });
    } catch (err) {
        console.error('Erro ao criar responsável:', err);
        return res.status(500).json({ error: 'Erro ao criar responsável' });
    }
};

// Função para criar um Gestor
export const criarGestor = async (req: Request, res: Response) => {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha || !telefone) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        const [existingGestor] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Gestor WHERE Email = ?', [email]);
        if (existingGestor.length > 0) {
            return res.status(409).json({ error: 'Email já está em uso' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        await db.promise().query('INSERT INTO Gestor (Nome, Email, Senha, Telefone) VALUES (?, ?, ?, ?)', [nome, email, hashedPassword, telefone]);

        return res.status(201).json({ message: 'Gestor criado com sucesso' });
    } catch (err) {
        console.error('Erro ao criar gestor:', err);
        return res.status(500).json({ error: 'Erro ao criar gestor' });
    }
};

// Função para buscar todos os registros (Alunos, Professores, Responsáveis e Gestores)
export const buscarTodos = async (req: Request, res: Response) => {
    try {
        const [alunos] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Aluno');
        const [professores] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Professor');
        const [responsaveis] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Responsavel');
        const [gestores] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Gestor');

        return res.status(200).json({
            alunos,
            professores,
            responsaveis,
            gestores
        });
    } catch (err) {
        console.error('Erro ao buscar registros:', err);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
};
