import { Router } from 'express';
import { getGestores, getGestorById, createGestor, updateGestor, activateGestor, deleteGestor } from '../controllers/gestorController';

const router = Router();

router.get('/', getGestores);
router.get('/:id', getGestorById);
router.post('/', createGestor);
router.put('/:id', updateGestor);
router.patch('/ativar/:id', activateGestor);
router.delete('/:id', deleteGestor);

export default router;
