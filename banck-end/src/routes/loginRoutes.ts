import { Router } from 'express';
import { 
  login, 
  loginProfessor, 
  loginGestor, 
  buscarResponsavelPorEmail, 
  criarGestor, 
  criarAluno, 
  criarProfessor,
  buscarTodos 
} from '../controllers/loginController';

const router = Router();

// Rota para login de Aluno
router.post('/login', async (req, res, next) => {
  try {
    const response = await login(req, res);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Rota para login de Professor
router.post('/loginProfessor', async (req, res, next) => {
  try {
    const response = await loginProfessor(req, res);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Rota para login de Gestor
router.post('/loginGestor', async (req, res, next) => {
  try {
    const response = await loginGestor(req, res);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Rota para buscar Responsável por Email
router.get('/responsavel', async (req, res, next) => {
  try {
    const response = await buscarResponsavelPorEmail(req, res);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Rota para criar Gestor
router.post('/criarGestor', async (req, res, next) => {
  try {
    const response = await criarGestor(req, res);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Rota para criar Aluno
router.post('/criarAluno', async (req, res, next) => {
  try {
    const response = await criarAluno(req, res);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Rota para criar Professor
router.post('/criarProfessor', async (req, res, next) => {
  try {
    const response = await criarProfessor(req, res);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Rota para buscar todos os registros
router.get('/todos', async (req, res, next) => {
    try {
        const response = await buscarTodos(req, res);
        res.json(response);
    } catch (error) {
        next(error);
    }
});

export default router;
