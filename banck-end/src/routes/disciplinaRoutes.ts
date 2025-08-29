// import { Router,Request, Response } from 'express';
import { Router } from 'express';
import {
  criarDisciplina,
  obterDisciplinas,
  deletarDisciplina,
  obterAtividadesPorDisciplina,
} from '../controllers/disciplinaController';

const router = Router();

// Rotas de Disciplina
router.post('/', criarDisciplina); // Criar disciplina
router.get('/', obterDisciplinas); // Listar disciplinas
router.delete('/:id', deletarDisciplina); // Deletar disciplina
router.get('/:id/atividades', obterAtividadesPorDisciplina); // Atividades da disciplina
// router.post('/:id/atividades', (req: Request, res: Response) => {
//   criarAtividadeParaDisciplina(req, res);
// });

export default router;
