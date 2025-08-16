import { Router, Request, Response } from 'express';

import {
  getFaltas,
  criarFalta,
  atualizarFalta,
  obterFaltasPorAluno,
  obterFaltasPorDisciplina,
  obterFaltasPorTurma,
  obterFaltasPorData,
  obterFaltasPorAlunoDisciplina,
  obterFaltasPorAlunoTurma
} from '../controllers/faltaController';

const router = Router();

// Criar nova falta
router.post('/', (req: Request, res: Response) => {
  criarFalta(req, res);
  
});

// Obter todas as faltas
router.get('/', getFaltas);

// Atualizar falta (justificar)
router.put('/:id', atualizarFalta);

// Rotas com múltiplos parâmetros — coloco antes para evitar conflito com rotas mais genéricas
router.get('/aluno/:alunoId/disciplina/:disciplinaId', obterFaltasPorAlunoDisciplina);
router.get('/aluno/:alunoId/turma/:turmaId', obterFaltasPorAlunoTurma);

// Rotas simples por filtro
router.get('/aluno/:alunoId', obterFaltasPorAluno);
router.get('/disciplina/:disciplinaId', obterFaltasPorDisciplina);
router.get('/turma/:turmaId', obterFaltasPorTurma);
router.get('/data/:dataFalta', obterFaltasPorData);

export default router;
