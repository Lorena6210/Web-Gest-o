import { Router } from 'express';
import {obterProvaCompleta, criarNotaProva, obterNotasProva, obterProvas, criarProva, atualizarProva, deletarProva, obterProvasPorTurma } from '../controllers/provaController';

const router = Router();

router.get('/completa', (req, res) => {
    obterProvaCompleta(req, res)
});

router.get('/', obterProvas);
router.post('/', (req, res) => {
    criarProva(req, res);
});
router.put('/:id', (req, res) => {
    atualizarProva(req, res);
});
router.delete('/:id', (req, res) => {
    deletarProva(req, res);
});

router.get('/turma/:turmaId', obterProvasPorTurma);
router.post('/provas/notas', (req, res) => {
  criarNotaProva(req, res);
});
router.get('/provas/:provaId/notas', obterNotasProva);

export default router;
