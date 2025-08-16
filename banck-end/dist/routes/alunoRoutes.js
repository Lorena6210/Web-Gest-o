"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alunoController_1 = require("../controllers/alunoController");
const router = (0, express_1.Router)();
router.get('/', alunoController_1.getAlunos);
router.get('/:id', alunoController_1.getAlunoById);
router.post('/', (req, res) => {
    (0, alunoController_1.createAluno)(req, res);
});
router.patch('/ativar/:id', alunoController_1.activateAluno);
router.put('/:id', alunoController_1.updateAluno);
router.delete('/:id', alunoController_1.deleteAluno);
exports.default = router;
