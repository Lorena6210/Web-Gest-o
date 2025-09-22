"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const boletimController_1 = require("../controllers/boletimController");
const router = express_1.default.Router();
// Notas
router.post('/notas/atividade', (req, res) => {
    (0, boletimController_1.criarOuAtualizarNotaAtividade)(req, res);
});
router.post('/notas/prova', (req, res) => {
    (0, boletimController_1.criarOuAtualizarNotaProva)(req, res);
});
router.get('/notas/:idAluno/:idDisciplina/:idBimestre', (req, res) => {
    (0, boletimController_1.getNotasPorAlunoDisciplinaBimestre)(req, res);
});
// Boletins
router.get('/', boletimController_1.getBoletins);
exports.default = router;
