"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const provaController_1 = require("../controllers/provaController");
const router = (0, express_1.Router)();
router.get('/', provaController_1.obterProvas);
router.post('/', (req, res) => {
    (0, provaController_1.criarProva)(req, res);
});
router.put('/:id', (req, res) => {
    (0, provaController_1.atualizarProva)(req, res);
});
router.delete('/:id', (req, res) => {
    (0, provaController_1.deletarProva)(req, res);
});
router.get('/turma/:turmaId', provaController_1.obterProvasPorTurma);
router.post('/provas/notas', (req, res) => {
    (0, provaController_1.criarNotaProva)(req, res);
});
router.get('/provas/:provaId/notas', provaController_1.obterNotasProva);
exports.default = router;
