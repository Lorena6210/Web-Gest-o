// /routes/notaRoutes.ts
import { Router } from 'express';
import {
  obterNotasPorAluno,
  criarNota,
  atualizarNota,
  deletarNota
} from '../controllers/notaController';

const router = Router();

// CRUD de notas
router.post('/', (req, res)=> {
  criarNota(req, res);});
router.put('/:id', (req, res)=> {
  atualizarNota(req, res);
});
router.delete('/:id', (req, res)=> {
  deletarNota(req, res);
});
// Filtros específicos
router.get('/aluno/:alunoId', obterNotasPorAluno);

export default router;
