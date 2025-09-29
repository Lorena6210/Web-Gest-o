"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notaController_1 = require("../controllers/notaController");
const router = (0, express_1.Router)();
// Rotas GET
router.get('/', notaController_1.obterNotas); // Todas as notas (com paginação)
router.get('/:id', (res, req) => { (0, notaController_1.obterNotaPorId)(req, res); }); // obterNotaPorId); // Nota por ID
router.get('/aluno/:alunoId', (res, req) => { (0, notaController_1.obterNotasPorAluno)(req, res); }); // Por aluno
router.get('/disciplina/:disciplinaId', (res, req) => { (0, notaController_1.obterNotasPorDisciplina)(req, res); }); // obterNotasPorDisciplina); // Por disciplina
router.get('/professor/:professorId', (res, req) => { (0, notaController_1.obterNotasPorProfessor)(req, res); }); // obterNotasPorProfessor); // Por professor
router.get('/turma/:turmaId', (res, req) => { (0, notaController_1.obterNotasPorTurma)(req, res); }); // obterNotasPorTurma); // Por turma
// Rotas POST/PUT/DELETE
router.post('/', (res, req) => { (0, notaController_1.criarNota)(req, res); }); // Criar nota
router.post('/massa', (res, req) => { (0, notaController_1.lançarNotasEmMassa)(req, res); });
router.put('/:id', (res, req) => { (0, notaController_1.atualizarNota)(req, res); }); // atualizarNota); // Atualizar nota
router.delete('/:id', (res, req) => { (0, notaController_1.deletarNota)(req, res); }); // deletarNota); // Deletar nota
exports.default = router;
