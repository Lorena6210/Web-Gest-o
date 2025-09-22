import { Router } from 'express';
import {
  criarDisciplinaNaGradeComBimestre,
  listarGradesCurriculares,
  atualizarGradeCurricular,
  deletarGradeCurricular,
  listarGradeComDisciplinas,
  listarProfessoresPorGradeEDisciplina
} from '../controllers/GradeCurricularController';

const router = Router();

// Listar professores de uma disciplina específica em uma grade
router.get('/:idGradeCurricular/disciplinas/:idDisciplina/professores', (req, res) => {
  listarProfessoresPorGradeEDisciplina(req, res);
});

// Criar nova grade curricular
router.post('/', (req, res) => {
  criarDisciplinaNaGradeComBimestre(req, res);
});

// Listar todas as grades curriculares
router.get('/', (req, res) => {
  listarGradesCurriculares(req, res);
});

// Atualizar uma grade curricular
router.put('/:id', (req, res) => {
  atualizarGradeCurricular(req, res);
});

// Deletar uma grade curricular
router.delete('/:id', (req, res) => {
  deletarGradeCurricular(req, res);
});

// Listar disciplinas de uma grade (query param opcional "bimestre")
router.get('/:id/disciplinas', (req, res) => {
  listarGradeComDisciplinas(req, res);
});

export default router;
