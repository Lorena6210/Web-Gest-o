"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faltaController_1 = require("../controllers/faltaController");
const router = (0, express_1.Router)();
// Criar nova falta
router.post('/', (req, res) => {
    (0, faltaController_1.criarFalta)(req, res);
});
// Obter todas as faltas
router.get('/', faltaController_1.getFaltas);
// Atualizar falta (justificar)
router.put('/:id', faltaController_1.atualizarFalta);
// Rotas com múltiplos parâmetros — coloco antes para evitar conflito com rotas mais genéricas
router.get('/aluno/:alunoId/disciplina/:disciplinaId', faltaController_1.obterFaltasPorAlunoDisciplina);
router.get('/aluno/:alunoId/turma/:turmaId', faltaController_1.obterFaltasPorAlunoTurma);
// Rotas simples por filtro
router.get('/aluno/:alunoId', faltaController_1.obterFaltasPorAluno);
router.get('/disciplina/:disciplinaId', faltaController_1.obterFaltasPorDisciplina);
router.get('/turma/:turmaId', faltaController_1.obterFaltasPorTurma);
router.get('/data/:dataFalta', faltaController_1.obterFaltasPorData);
exports.default = router;
