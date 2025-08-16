"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// /routes/bimestreRoutes.ts
const express_1 = require("express");
const bimestreController_1 = require("../controllers/bimestreController");
const router = (0, express_1.Router)();
router.get('/:bimestre', bimestreController_1.obterNotasPorBimestre);
exports.default = router;
