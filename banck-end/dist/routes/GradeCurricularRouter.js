"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GradeCurricularController_1 = require("../controllers/GradeCurricularController");
const router = (0, express_1.Router)();
router.get('/disciplinas/:idTurma/:idProfessor', (req, res) => {
    (0, GradeCurricularController_1.listarDisciplinasPorTurmaEProfessor)(req, res);
});
router.get('/:id/disciplinas', GradeCurricularController_1.listarDisciplinasDaGrade);
router.post('/', (req, res) => {
    (0, GradeCurricularController_1.criarGradeCurricular)(req, res);
});
router.put('/:id', (req, res) => {
    (0, GradeCurricularController_1.atualizarGradeCurricular)(req, res);
});
router.delete('/:id', (req, res) => {
    (0, GradeCurricularController_1.deletarGradeCurricular)(req, res);
});
router.delete('/:id/disciplina/:disciplinaId', (req, res) => {
    (0, GradeCurricularController_1.removerDisciplinaDaGrade)(req, res);
});
exports.default = router;
