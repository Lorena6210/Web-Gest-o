"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { Router,Request, Response } from 'express';
const express_1 = require("express");
const disciplinaController_1 = require("../controllers/disciplinaController");
const router = (0, express_1.Router)();
// Rotas de Disciplina
router.post('/', disciplinaController_1.criarDisciplina); // Criar disciplina
router.get('/', disciplinaController_1.obterDisciplinas); // Listar disciplinas
router.delete('/:id', disciplinaController_1.deletarDisciplina); // Deletar disciplina
router.get('/:id/atividades', disciplinaController_1.obterAtividadesPorDisciplina); // Atividades da disciplina
// router.post('/:id/atividades', (req: Request, res: Response) => {
//   criarAtividadeParaDisciplina(req, res);
// });
exports.default = router;
