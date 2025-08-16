// /routes/atividadeRoutes.ts
import { Router } from 'express';
import { obterAtividades, atualizarAtividade, criarAtividade, responderAtividade, deletarAtividade } from '../controllers/atividadeController';

const router = Router();

router.get('/', obterAtividades);
router.post('/', criarAtividade);
router.put('/:id', atualizarAtividade);
router.post('/:id/responder', responderAtividade);
router.delete('/:id', deletarAtividade);

export default router;
