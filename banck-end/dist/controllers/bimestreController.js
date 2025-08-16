"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterNotasPorBimestre = void 0;
const db_1 = __importDefault(require("../db"));
const obterNotasPorBimestre = (req, res) => {
    const { bimestre } = req.params;
    db_1.default.query('SELECT * FROM Bimestre_Nota WHERE Id_Bimestre = ?', [bimestre], (err, rows) => {
        if (err) {
            console.error('Erro ao obter notas por bimestre:', err);
            return res.status(500).json({ error: 'Erro ao obter notas por bimestre' });
        }
        res.json(rows);
    });
};
exports.obterNotasPorBimestre = obterNotasPorBimestre;
