import { Router } from 'express';
import { 
  getProfessores,
  getProfessorById,
  createProfessor,
  deleteProfessor,
  activateProfessor,
  updateProfessor,
} from '../controllers/professorController';

const router = Router();

router.get('/', getProfessores);
router.get('/:id', getProfessorById);
router.post('/', createProfessor);
router.put('/:id',updateProfessor);
router.delete('/:id', deleteProfessor);
router.patch('/ativar/:id', activateProfessor);

export default router;
