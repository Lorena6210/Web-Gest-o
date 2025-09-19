import { Router } from 'express';
import { criarNotaAtividade, obterNotasAtividade, criarAtividade, obterAtividades, atualizarAtividade, deletarAtividade } from '../controllers/atividadeController';

const router = Router();

router.post('/atividades', (req, res) => {
  criarAtividade(req, res);
});
router.get('/', obterAtividades);
router.put('/atividades/:id', (req, res) => {
  atualizarAtividade(req, res);
});
router.delete('/atividades/:id', (req, res) => {
  deletarAtividade(req, res);
});

router.post('/atividades/:atividadeId/notas', (req, res) => {
  criarNotaAtividade(req, res);
});
router.get('/atividades/:atividadeId/notas', obterNotasAtividade);

export default router;
