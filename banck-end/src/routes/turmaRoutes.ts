import { Router, Request, Response } from 'express';
import {
  criarTurma,
  obterTurmaCompleta,
  listarTurmasComDetalhes,
  adicionarAluno,
  removerAluno,
  adicionarProfessorTurmaDisciplina,
  adicionarDisciplina,
  adicionarFalta,
  adicionarNotaItem,
  adicionarAtividade,
  adicionarEvento,
  visualizarNotasItens,
} from '../controllers/turmaController';

const router = Router();

// Criar turma
router.post('/', criarTurma);

// Listar todas as turmas básicas
router.get('/', listarTurmasComDetalhes);

// 🔹 Buscar uma turma completa por ID (compatível com seu fetchTurmaCompleta)
router.get('/:id/completa', (req: Request, res: Response) => {
  obterTurmaCompleta(req, res);
});

// Adicionar/remover aluno
router.post('/:idTurma/alunos/:idAluno', (req: Request, res: Response) => {
  adicionarAluno(req, res)});
router.delete('/:idTurma/alunos/:idAluno', removerAluno);

// Adicionar professor e disciplina
router.post('/:idTurma/professores/:idProfessor/disciplinas/:idDisciplina', (req: Request, res: Response) => {
  adicionarProfessorTurmaDisciplina(req, res);
});
// Adicionar disciplina
router.post('/:idTurma/disciplinas/:idDisciplina', adicionarDisciplina);

// Adicionar falta
router.post('/:idTurma/alunos/:idAluno/faltas', (req: Request, res: Response) => {
  adicionarFalta(req, res);
});

// Adicionar nota
// Adicionar nota
router.post('/:idTurma/alunos/:idAluno/notas', (req: Request, res: Response) => {
  adicionarNotaItem(req, res);
});

// Adicionar atividade
router.post('/:idTurma/atividades', adicionarAtividade);

// Adicionar evento
router.post('/:idTurma/eventos', adicionarEvento);

// Visualizar notas e faltas
router.get('/alunos/:idAluno/notas-faltas', visualizarNotasItens);


export default router;
