"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvento = exports.getEventos = void 0;
const db_1 = __importDefault(require("../db"));
// Lista eventos (opcionalmente por responsável)
const getEventos = (req, res) => {
    const { Id_Responsavel } = req.query;
    let query = `
    SELECT e.Id, e.Titulo, e.Descricao, e.Data,
           r.Nome AS Responsavel, e.CriadoPor
    FROM eventos e
    LEFT JOIN responsaveis r ON e.Id_Responsavel = r.Id
  `;
    const values = [];
    if (Id_Responsavel) {
        query += " WHERE e.Id_Responsavel = ?";
        values.push(Id_Responsavel);
    }
    db_1.default.query(query, values, (err, rows) => {
        if (err) {
            console.error("Erro ao buscar eventos:", err);
            return res.status(500).json({ error: "Erro ao buscar eventos" });
        }
        res.json(rows);
    });
};
exports.getEventos = getEventos;
// Cria um novo evento
const createEvento = (req, res) => {
    const { Titulo, Descricao, Data, Id_Responsavel, CriadoPor } = req.body;
    // Validação -> se faltar algum campo obrigatório
    if (!Titulo || !Data || !Id_Responsavel) {
        return res
            .status(400)
            .json({ error: "Preencha todos os campos obrigatórios" });
    }
    const query = `
    INSERT INTO eventos (Titulo, Descricao, Data, Id_Responsavel, CriadoPor)
    VALUES (?, ?, ?, ?, ?)
  `;
    db_1.default.query(query, [Titulo, Descricao, Data, Id_Responsavel, CriadoPor], (err, result) => {
        if (err) {
            console.error("Erro ao criar evento:", err);
            return res.status(500).json({ error: "Erro ao criar evento" });
        }
        res.status(201).json({
            message: "Evento criado com sucesso",
            id: result.insertId,
        });
    });
};
exports.createEvento = createEvento;
