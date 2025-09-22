"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GradeCurricularController_1 = require("../controllers/GradeCurricularController");
const router = (0, express_1.Router)();
// Listar professores de uma disciplina específica em uma grade
router.get('/:idGradeCurricular/disciplinas/:idDisciplina/professores', (req, res) => {
    (0, GradeCurricularController_1.listarProfessoresPorGradeEDisciplina)(req, res);
});
// Criar nova grade curricular
router.post('/', (req, res) => {
    (0, GradeCurricularController_1.criarDisciplinaNaGradeComBimestre)(req, res);
});
// Listar todas as grades curriculares
router.get('/', (req, res) => {
    (0, GradeCurricularController_1.listarGradesCurriculares)(req, res);
});
// Atualizar uma grade curricular
router.put('/:id', (req, res) => {
    (0, GradeCurricularController_1.atualizarGradeCurricular)(req, res);
});
// Deletar uma grade curricular
router.delete('/:id', (req, res) => {
    (0, GradeCurricularController_1.deletarGradeCurricular)(req, res);
});
// Listar disciplinas de uma grade (query param opcional "bimestre")
router.get('/:id/disciplinas', (req, res) => {
    (0, GradeCurricularController_1.listarGradeComDisciplinas)(req, res);
});
exports.default = router;
