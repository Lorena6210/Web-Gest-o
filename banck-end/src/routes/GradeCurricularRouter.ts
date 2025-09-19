import { Router, Request, Response } from 'express';
import { listarDisciplinasPorTurmaEProfessor, criarGradeCurricular, removerDisciplinaDaGrade, atualizarGradeCurricular, deletarGradeCurricular, listarDisciplinasDaGrade } from '../controllers/GradeCurricularController';

const router = Router();

router.get('/disciplinas/:idTurma/:idProfessor', (req: Request, res: Response) => {
    listarDisciplinasPorTurmaEProfessor(req, res);
});

router.get('/:id/disciplinas', listarDisciplinasDaGrade);
router.post('/', (req: Request, res: Response) => {
    criarGradeCurricular(req, res);
});
router.put('/:id', (req, res) => {
    atualizarGradeCurricular(req, res);
});
router.delete('/:id', (req, res) => {
    deletarGradeCurricular(req, res);
});
router.delete('/:id/disciplina/:disciplinaId', (req, res) => {
    removerDisciplinaDaGrade(req, res);
});

export default router;