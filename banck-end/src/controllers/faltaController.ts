import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../db';

interface QueryResult {
  affectedRows: number;
}

export const criarFalta = (req: Request, res: Response) => {
  const { Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada } = req.body;

  // Função para garantir que existe o registro na tabela, criando se necessário
  const garantirExistencia = (table: string, id: number, nome: string) => {
  return new Promise<void>((resolve, reject) => {
    db.query(`SELECT Id FROM ${table} WHERE Id = ?`, [id], (err, results: RowDataPacket[]) => {
      if (err) return reject(err);

      if (results.length === 0) {
        if (table === 'Aluno') {
          // Inserir aluno com todos os campos obrigatórios preenchidos para evitar erro
          db.query(
            `INSERT INTO Aluno (Id, Nome, CPF, Telefone, Senha) VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              nome,
              '00000000000',      // CPF padrão
              '00000000000',      // Telefone padrão
              'senha123'          // Senha padrão (ajuste conforme seu schema)
            ],
            (insertErr) => {
              if (insertErr) return reject(insertErr);
              resolve();
            }
          );
        } else {
          // Para Turma e Disciplina, inserir só Id e Nome
          db.query(
            `INSERT INTO ${table} (Id, Nome) VALUES (?, ?)`,
            [id, nome],
            (insertErr) => {
              if (insertErr) return reject(insertErr);
              resolve();
            }
          );
        }
      } else {
        resolve();
      }
    });
  });
};



  Promise.all([
    garantirExistencia('Aluno', Id_Aluno, 'Aluno Criado Automaticamente'),
    garantirExistencia('Turma', Id_Turma, 'Turma Criada Automaticamente'),
    garantirExistencia('Disciplina', Id_Disciplina, 'Disciplina Criada Automaticamente'),
  ])
    .then(() => {
      db.query(
        'INSERT INTO Falta (Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada) VALUES (?, ?, ?, ?, ?)',
        [Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada || false],
        (err) => {
          if (err) {
            console.error('Erro ao criar falta:', err);
            return res.status(500).json({ error: 'Erro ao criar falta', details: err.message });
          }
          res.status(201).json({ message: 'Falta criada com sucesso' });
        }
      );
    })
    .catch((err) => {
      console.error('Erro ao garantir existência dos dados relacionados:', err);
      res.status(500).json({ error: 'Erro ao preparar dados para falta', details: err.message });
    });
};


// Obter todas as faltas
export const getFaltas = (req: Request, res: Response) => {
  db.query('SELECT * FROM Falta', (err, rows) => {
    if (err) {
      console.error('Erro ao obter faltas:', err);
      return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
    }
    return res.json(rows);
  });
};

// Atualizar falta (justificar)
export const atualizarFalta = (req: Request, res: Response) => {
  const { id } = req.params;
  const { Justificada } = req.body;

  const query = 'UPDATE Falta SET Justificada = ? WHERE Id = ?';

  db.query(query, [Justificada, id], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar falta:', err);
      return res.status(500).json({ error: 'Erro ao atualizar falta', detalhes: err.message });
    }
    if ((result as QueryResult).affectedRows === 0) {
      return res.status(404).json({ error: 'Falta não encontrada' });
    }
    return res.json({ message: 'Falta atualizada com sucesso' });
  });
};

// Obter faltas por aluno
export const obterFaltasPorAluno = (req: Request, res: Response) => {
  const { alunoId } = req.params;
  db.query('SELECT * FROM Falta WHERE Id_Aluno = ?', [alunoId], (err, rows) => {
    if (err) {
      console.error('Erro ao obter faltas por aluno:', err);
      return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
    }
    return res.json(rows);
  });
};

// Obter faltas por disciplina
export const obterFaltasPorDisciplina = (req: Request, res: Response) => {
  const { disciplinaId } = req.params;
  db.query('SELECT * FROM Falta WHERE Id_Disciplina = ?', [disciplinaId], (err, rows) => {
    if (err) {
      console.error('Erro ao obter faltas por disciplina:', err);
      return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
    }
    return res.json(rows);
  });
};

// Obter faltas por turma
export const obterFaltasPorTurma = (req: Request, res: Response) => {
  const { turmaId } = req.params;
  db.query('SELECT * FROM Falta WHERE Id_Turma = ?', [turmaId], (err, rows) => {
    if (err) {
      console.error('Erro ao obter faltas por turma:', err);
      return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
    }
    return res.json(rows);
  });
};

// Obter faltas por data
export const obterFaltasPorData = (req: Request, res: Response) => {
  const { dataFalta } = req.params;
  db.query('SELECT * FROM Falta WHERE DataFalta = ?', [dataFalta], (err, rows) => {
    if (err) {
      console.error('Erro ao obter faltas por data:', err);
      return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
    }
    return res.json(rows);
  });
};

// Obter faltas por aluno e disciplina
export const obterFaltasPorAlunoDisciplina = (req: Request, res: Response) => {
  const { alunoId, disciplinaId } = req.params;
  db.query(
    'SELECT * FROM Falta WHERE Id_Aluno = ? AND Id_Disciplina = ?',
    [alunoId, disciplinaId],
    (err, rows) => {
      if (err) {
        console.error('Erro ao obter faltas por aluno e disciplina:', err);
        return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
      }
      return res.json(rows);
    }
  );
};

// Obter faltas por aluno e turma
export const obterFaltasPorAlunoTurma = (req: Request, res: Response) => {
  const { alunoId, turmaId } = req.params;
  db.query(
    'SELECT * FROM Falta WHERE Id_Aluno = ? AND Id_Turma = ?',
    [alunoId, turmaId],
    (err, rows) => {
      if (err) {
        console.error('Erro ao obter faltas por aluno e turma:', err);
        return res.status(500).json({ error: 'Erro ao obter faltas', detalhes: err.message });
      }
      return res.json(rows);
    }
  );
};
