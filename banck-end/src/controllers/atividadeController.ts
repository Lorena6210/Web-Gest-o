import { Request, Response } from 'express';
import db from '../db';
import { OkPacket } from 'mysql2';

// Obter todas as atividades com informações completas
export const obterAtividades = (req: Request, res: Response) => {
  const sql = `
    SELECT 
      a.Id AS id,
      a.Titulo AS titulo,
      a.Descricao AS descricao,
      a.DataAtividade AS dataAtividade,
      a.DataEntrega AS dataEntrega,
      a.Valor AS valor,
      a.Tipo AS tipo,
      ptd.Id AS idProfessorTurmaDisciplina,
      p.Nome AS professor,
      t.Nome AS turma,
      d.Nome AS disciplina
    FROM Atividade a
    JOIN Professor_Turma_Disciplina ptd ON a.Id_Professor_Turma_Disciplina = ptd.Id
    JOIN Professor p ON ptd.Id_Professor = p.Id
    JOIN Turma t ON ptd.Id_Turma = t.Id
    JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar atividades' });
    res.json(results);
  });
};

// Criar nova atividade
export const criarAtividade = (req: Request, res: Response) => {
  const { Id_Professor_Turma_Disciplina, Titulo, Descricao, DataAtividade, DataEntrega, Valor, Tipo } = req.body;

  const sql = `
    INSERT INTO Atividade 
      (Id_Professor_Turma_Disciplina, Titulo, Descricao, DataAtividade, DataEntrega, Valor, Tipo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [Id_Professor_Turma_Disciplina, Titulo, Descricao, DataAtividade, DataEntrega, Valor, Tipo], (err, result: OkPacket) => {
    if (err) return res.status(500).json({ error: 'Erro ao criar atividade' });
    res.status(201).json({ message: 'Atividade criada com sucesso', id: result.insertId });
  });
};

// Atualizar atividade
export const atualizarAtividade = (req: Request, res: Response) => {
  const { id } = req.params;
  const { Titulo, Descricao, DataEntrega, Valor, Tipo } = req.body;

  const sql = `
    UPDATE Atividade
    SET Titulo = ?, Descricao = ?, DataEntrega = ?, Valor = ?, Tipo = ?
    WHERE Id = ?
  `;
  db.query(sql, [Titulo, Descricao, DataEntrega, Valor, Tipo, id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao atualizar atividade' });
    res.json({ message: 'Atividade atualizada com sucesso' });
  });
};

// Deletar atividade
export const deletarAtividade = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('DELETE FROM Atividade WHERE Id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar atividade' });
    res.json({ message: 'Atividade deletada com sucesso' });
  });
};

export const responderAtividade = (req: Request, res: Response) => {
  const { idAtividade } = req.params;
  const { idAluno, Resposta } = req.body;

  const sql = `
    INSERT INTO Resposta_Atividade (Id_Atividade, Id_Aluno, Resposta)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE Resposta = VALUES(Resposta), DataResposta = CURRENT_TIMESTAMP
  `;

  db.query(sql, [idAtividade, idAluno, Resposta], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao registrar resposta' });
    res.json({ message: 'Resposta registrada com sucesso' });
  });
};
