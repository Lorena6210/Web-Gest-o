// /routes/historicoMedicoRoutes.ts
import { Router } from 'express';
import { criarHistoricoMedico, obterHistoricoMedico, deletarHistoricoMedico } from '../controllers/historicoMedicoController';

const router = Router();

router.post('/', criarHistoricoMedico);
router.get('/:alunoId', obterHistoricoMedico);
router.delete('/:id', deletarHistoricoMedico);

export default router;
