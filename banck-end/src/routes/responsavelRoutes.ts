import { Router } from 'express';
import { getResponsaveis, getResponsavelById, createResponsavel, updateResponsavel, deleteResponsavel, activateResponsavel } from '../controllers/responsavelController';

const router = Router();

router.get('/', getResponsaveis);
router.get('/:id', getResponsavelById);
router.post('/', createResponsavel);
router.put('/:id', updateResponsavel);
router.patch('/ativar/:id', activateResponsavel);
router.delete('/:id', deleteResponsavel);

export default router;
