"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /routes/notaRoutes.ts
const express_1 = require("express");
const notaController_1 = require("../controllers/notaController");
const router = (0, express_1.Router)();
// CRUD de notas
router.post('/', (req, res) => {
    (0, notaController_1.criarNota)(req, res);
});
router.put('/:id', (req, res) => {
    (0, notaController_1.atualizarNota)(req, res);
});
router.delete('/:id', (req, res) => {
    (0, notaController_1.deletarNota)(req, res);
});
// Filtros específicos
router.get('/aluno/:alunoId', notaController_1.obterNotasPorAluno);
exports.default = router;
