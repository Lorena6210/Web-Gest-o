// /routes/atividadeRoutes.ts
import { Router , Request, Response} from 'express';
import { obterAtividades, atualizarAtividade, criarAtividade, responderAtividade, deletarAtividade } from '../controllers/atividadeController';

const router = Router();

router.get('/', obterAtividades);
router.post('/', (req: Request, res: Response) => {
  criarAtividade(req, res);
});
router.put('/:id', atualizarAtividade);
router.post('/:id/responder', responderAtividade);
router.delete('/:id', deletarAtividade);

export default router;
