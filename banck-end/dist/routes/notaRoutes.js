"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /routes/notaRoutes.ts
const express_1 = require("express");
const notaController_1 = require("../controllers/notaController");
const router = (0, express_1.Router)();
// CRUD de notas
router.post('/', notaController_1.criarNota);
router.put('/:id', notaController_1.atualizarNota);
router.delete('/:id', notaController_1.deletarNota);
// Obter nota específica
router.get('/:id', notaController_1.obterNotaPorId);
// Listagem geral
router.get('/', notaController_1.obterNotas);
// Filtros específicos
router.get('/aluno/:alunoId', notaController_1.obterNotasPorAluno);
router.get('/disciplina/:disciplinaId', notaController_1.obterNotasPorDisciplina);
router.get('/professor/:professorId', notaController_1.obterNotasPorProfessor);
router.get('/turma/:turmaId', notaController_1.obterNotasPorTurma);
exports.default = router;
