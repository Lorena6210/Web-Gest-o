import express from 'express';
import {
  criarOuAtualizarNotaAtividade,
  criarOuAtualizarNotaProva,
  getNotasPorAlunoDisciplinaBimestre,
  getBoletins,

} from '../controllers/boletimController';

const router = express.Router();

// Notas
router.post('/notas/atividade', (req, res) => {
  criarOuAtualizarNotaAtividade(req, res);
});
router.post('/notas/prova', (req, res) => {
  criarOuAtualizarNotaProva(req, res);
});
router.get('/notas/:idAluno/:idDisciplina/:idBimestre', (req, res) => {
  getNotasPorAlunoDisciplinaBimestre(req, res);
});

// Boletins
router.get('/', getBoletins);

export default router;
