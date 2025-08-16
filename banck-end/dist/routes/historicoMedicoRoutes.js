"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /routes/historicoMedicoRoutes.ts
const express_1 = require("express");
const historicoMedicoController_1 = require("../controllers/historicoMedicoController");
const router = (0, express_1.Router)();
router.post('/', historicoMedicoController_1.criarHistoricoMedico);
router.get('/:alunoId', historicoMedicoController_1.obterHistoricoMedico);
router.delete('/:id', historicoMedicoController_1.deletarHistoricoMedico);
exports.default = router;
