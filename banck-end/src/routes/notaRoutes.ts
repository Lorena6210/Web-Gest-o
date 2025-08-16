// /routes/notaRoutes.ts
import { Router } from 'express';
import {
  criarNota,
  atualizarNota,
  deletarNota,
  obterNotaPorId,
  obterNotas,
  obterNotasPorAluno,
  obterNotasPorDisciplina,
  obterNotasPorProfessor,
  obterNotasPorTurma,
} from '../controllers/notaController';

const router = Router();

// CRUD de notas
router.post('/', criarNota);
router.put('/:id', atualizarNota);
router.delete('/:id', deletarNota);

// Obter nota específica
router.get('/:id', obterNotaPorId);

// Listagem geral
router.get('/', obterNotas);

// Filtros específicos
router.get('/aluno/:alunoId', obterNotasPorAluno);
router.get('/disciplina/:disciplinaId', obterNotasPorDisciplina);
router.get('/professor/:professorId', obterNotasPorProfessor);
router.get('/turma/:turmaId', obterNotasPorTurma);

export default router;
