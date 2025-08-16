// /routes/disciplinaRoutes.ts
import { Router } from 'express';
import { criarDisciplina, obterDisciplinas } from '../controllers/disciplinaController';

const router = Router();

router.post('/', criarDisciplina);
router.get('/', obterDisciplinas); // corrigido

export default router;
