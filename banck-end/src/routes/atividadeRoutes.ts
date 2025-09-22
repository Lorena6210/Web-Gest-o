import { Router } from 'express';
import { criarNotaAtividade, obterNotasAtividade, criarAtividade, obterAtividades, atualizarAtividade, deletarAtividade } from '../controllers/atividadeController';

const router = Router();

router.post('/atividades', (req, res) => {
  criarAtividade(req, res);
});
router.get('/', obterAtividades);
router.put('/:id', (req, res) => {
  atualizarAtividade(req, res);
});
router.delete('/:id', (req, res) => {
  deletarAtividade(req, res);
});

router.post('/:atividadeId/notas', (req, res) => {
  criarNotaAtividade(req, res);
});
router.get('/:atividadeId/notas', obterNotasAtividade);

export default router;
