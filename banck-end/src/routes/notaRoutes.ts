// /routes/notaRoutes.ts
import { Request, Response } from 'express';
import { Router } from 'express';
import { 
  obterNotas, obterNotaPorId, obterNotasPorAluno, obterNotasPorDisciplina, lançarNotasEmMassa,
  obterNotasPorProfessor, obterNotasPorTurma, criarNota, atualizarNota, deletarNota 
} from '../controllers/notaController';

const router = Router();

// Rotas GET
router.get('/', obterNotas); // Todas as notas (com paginação)
router.get('/:id', (res: Response, req: Request) => {obterNotaPorId(req, res)}); // obterNotaPorId); // Nota por ID
router.get('/aluno/:alunoId',(res: Response, req: Request) => {obterNotasPorAluno(req, res)}); // Por aluno
router.get('/disciplina/:disciplinaId', (res: Response, req: Request) => {obterNotasPorDisciplina(req, res)}); // obterNotasPorDisciplina); // Por disciplina
router.get('/professor/:professorId',(res: Response, req: Request) => {obterNotasPorProfessor(req, res)}); // obterNotasPorProfessor); // Por professor
router.get('/turma/:turmaId', (res: Response, req: Request) => {obterNotasPorTurma(req, res)}); // obterNotasPorTurma); // Por turma

// Rotas POST/PUT/DELETE
router.post('/',(res: Response, req: Request) => {criarNota(req, res)});  // Criar nota
router.post('/massa', (res: Response, req: Request) => {lançarNotasEmMassa(req, res)});
router.put('/:id', (res: Response, req: Request) => {atualizarNota(req, res)}); // atualizarNota); // Atualizar nota
router.delete('/:id', (res: Response, req: Request) => {deletarNota(req, res)}); // deletarNota); // Deletar nota


export default router;
