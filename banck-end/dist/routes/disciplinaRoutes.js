"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /routes/disciplinaRoutes.ts
const express_1 = require("express");
const disciplinaController_1 = require("../controllers/disciplinaController");
const router = (0, express_1.Router)();
router.post('/', disciplinaController_1.criarDisciplina);
router.get('/', disciplinaController_1.obterDisciplinas); // corrigido
exports.default = router;
