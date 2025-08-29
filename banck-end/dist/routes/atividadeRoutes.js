"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /routes/atividadeRoutes.ts
const express_1 = require("express");
const atividadeController_1 = require("../controllers/atividadeController");
const router = (0, express_1.Router)();
router.get('/', atividadeController_1.obterAtividades);
router.post('/', (req, res) => {
    (0, atividadeController_1.criarAtividade)(req, res);
});
router.put('/:id', atividadeController_1.atualizarAtividade);
router.post('/:id/responder', atividadeController_1.responderAtividade);
router.delete('/:id', atividadeController_1.deletarAtividade);
exports.default = router;
