import { Router, Request, Response } from 'express';
import { getAlunos, getAlunoById, createAluno, updateAluno , activateAluno, deleteAluno } from '../controllers/alunoController';

const router = Router();

router.get('/', getAlunos);
router.get('/:id', getAlunoById);
router.post('/', (req: Request, res: Response) => {
	createAluno(req, res);
});
router.patch('/ativar/:id', activateAluno);
router.put('/:id', updateAluno);
router.delete('/:id', deleteAluno);

export default router;