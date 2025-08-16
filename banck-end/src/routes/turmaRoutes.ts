import { Router, Request, Response } from 'express';
import {
  criarTurma,
  obterTurmaCompleta,
  listarTurmas,
  adicionarAluno,
  removerAluno,
  adicionarProfessorTurmaDisciplina,
  adicionarDisciplina,
  adicionarFalta,
  adicionarNota,
  adicionarAtividade,
  adicionarEvento,
  visualizarNotasEFaltas,
} from '../controllers/turmaController';

const router = Router();

// Criar turma
router.post('/', criarTurma);

// Listar todas as turmas básicas
router.get('/', listarTurmas);

// 🔹 Buscar uma turma completa por ID (compatível com seu fetchTurmaCompleta)
router.get('/:id/completa', obterTurmaCompleta);

// Adicionar/remover aluno
router.post('/:idTurma/alunos/:idAluno', adicionarAluno);
router.delete('/:idTurma/alunos/:idAluno', removerAluno);

// Adicionar professor e disciplina
router.post('/:idTurma/professores/:idProfessor/disciplinas/:idDisciplina', adicionarProfessorTurmaDisciplina);

// Adicionar disciplina
router.post('/:idTurma/disciplinas/:idDisciplina', adicionarDisciplina);

// Adicionar falta
router.post('/:idTurma/alunos/:idAluno/faltas', (req: Request, res: Response) => {
  adicionarFalta(req, res);
});

// Adicionar nota
router.post('/:idTurma/alunos/:idAluno/notas', adicionarNota);

// Adicionar atividade
router.post('/:idTurma/atividades', adicionarAtividade);

// Adicionar evento
router.post('/:idTurma/eventos', adicionarEvento);

// Visualizar notas e faltas
router.get('/alunos/:idAluno/notas-faltas', visualizarNotasEFaltas);


export default router;
