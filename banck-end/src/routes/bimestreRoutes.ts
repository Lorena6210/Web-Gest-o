// /routes/bimestreRoutes.ts
import { Router } from 'express';
import { obterNotasPorBimestre } from '../controllers/bimestreController';

const router = Router();

router.get('/:bimestre', obterNotasPorBimestre);

export default router;
