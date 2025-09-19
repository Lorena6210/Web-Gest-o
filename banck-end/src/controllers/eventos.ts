import type { Request, Response } from "express";
import db from "../db";
import { OkPacket } from "mysql2";

// Lista eventos (opcionalmente por responsável)
export const getEventos = (req: Request, res: Response) => {
  const { Id_Responsavel } = req.query;
  let query = `
    SELECT e.Id, e.Titulo, e.Descricao, e.Data,
           r.Nome AS Responsavel, e.CriadoPor
    FROM eventos e
    LEFT JOIN responsaveis r ON e.Id_Responsavel = r.Id
  `;
  const values: unknown[] = [];

  if (Id_Responsavel) {
    query += " WHERE e.Id_Responsavel = ?";
    values.push(Id_Responsavel);
  }

  db.query(query, values, (err, rows) => {
    if (err) {
      console.error("Erro ao buscar eventos:", err);
      return res.status(500).json({ error: "Erro ao buscar eventos" });
    }
    res.json(rows);
  });
};

// Cria um novo evento
export const createEvento = (req: Request, res: Response) => {
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

  db.query(
    query,
    [Titulo, Descricao, Data, Id_Responsavel, CriadoPor],
    (err, result: OkPacket) => {
      if (err) {
        console.error("Erro ao criar evento:", err);
        return res.status(500).json({ error: "Erro ao criar evento" });
      }

      res.status(201).json({
        message: "Evento criado com sucesso",
        id: result.insertId,
      });
    }
  );
};
