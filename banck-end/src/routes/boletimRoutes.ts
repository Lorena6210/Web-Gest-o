import express from 'express';
import {
  criarOuAtualizarNotaAtividade,
  criarOuAtualizarNotaProva,
  getNotasPorAlunoDisciplinaBimestre,
  getBoletins,
  createOrUpdateBoletim,
  getBoletimPorAluno,
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
router.post('/boletins', createOrUpdateBoletim);
router.get('/boletins/aluno/:idAluno', getBoletimPorAluno);

export default router;
