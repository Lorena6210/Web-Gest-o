"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const atividadeController_1 = require("../controllers/atividadeController");
const router = (0, express_1.Router)();
router.post('/atividades', (req, res) => {
    (0, atividadeController_1.criarAtividade)(req, res);
});
router.get('/', atividadeController_1.obterAtividades);
router.put('/atividades/:id', (req, res) => {
    (0, atividadeController_1.atualizarAtividade)(req, res);
});
router.delete('/atividades/:id', (req, res) => {
    (0, atividadeController_1.deletarAtividade)(req, res);
});
router.post('/atividades/:atividadeId/notas', (req, res) => {
    (0, atividadeController_1.criarNotaAtividade)(req, res);
});
router.get('/atividades/:atividadeId/notas', atividadeController_1.obterNotasAtividade);
exports.default = router;
