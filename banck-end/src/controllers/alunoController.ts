import type { Request, Response } from 'express';
import db from '../db';

// Funções de controle para Alunos
export const getAlunos = (req: Request, res: Response) => {
  db.query('SELECT * FROM Aluno WHERE Status = "Ativo"', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
    res.json(rows);
  });
};

export const getAlunoById = (req: Request, res: Response) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM Aluno 
    WHERE (RA = ? OR Nome = ? OR Id = ?) 
    AND Status = 'Ativo'
  `;

  db.query(query, [id, id, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar aluno' });
    }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.status(200).json(results);
  })
};

export const createAluno = async (req: Request, res: Response) => {
  const { Nome, CPF,  Senha, Telefone, DataNascimento, Genero, FotoPerfil, Status, RA } = req.body;
  // Validação dos campos obrigatórios
  if (!Nome || !CPF || !Senha || !RA) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios faltando: Nome, CPF, Email, Senha e RA são necessários' 
    });
  }
  try {
    // Inserção no banco de dados usando async/await
    const [result] = await db.promise().query(
      `INSERT INTO Aluno (Nome, CPF, Senha, Telefone, DataNascimento, Genero, FotoPerfil, Status, RA) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Nome, CPF,  Senha, Telefone, DataNascimento, Genero, FotoPerfil || null, Status || 'Ativo', RA]
    ) as [import('mysql2').ResultSetHeader, unknown];
    res.status(201).json({ 
      message: 'Aluno cadastrado com sucesso',
      id: result.insertId // retorna o id do aluno inserido
    });
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'sqlState' in error &&
      (error as { sqlState?: string }).sqlState === '23000'
    ) {
      return res.status(409).json({ 
        error: 'CPF ou Email já cadastrado para outro aluno' 
      });
    }
    return res.status(500).json({ error: 'Erro ao cadastrar aluno' });
  }
};


export const updateAluno = (req: Request, res: Response) => {
  const { id } = req.params;
  const { Nome, Telefone, RA } = req.body;
  console.log('Dados recebidos:', { id, Nome, Telefone, RA });
  db.query(
    'UPDATE Aluno SET Nome = ?, Telefone = ?, RA = ? WHERE Id = ?',
    [Nome, Telefone, RA, id],
    (err, result) => {
      if (err) {
        console.error('Erro MySQL:', err);
        return res.status(500).json({ error: 'Erro ao atualizar aluno', details: err.message });
      }
      const affectedRows = (result as import('mysql2').ResultSetHeader).affectedRows;
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
      res.json({ message: 'Aluno atualizado com sucesso' });
    }
  );
};

export const activateAluno = (req: Request, res: Response) => {
  const { id } = req.params;

  db.query('UPDATE Aluno SET Status = "Ativo" WHERE Id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ativar aluno' });
    }

    const affectedRows = (result as import('mysql2').ResultSetHeader).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado ou já está ativo' });
    }

    res.json({ message: 'Aluno ativado com sucesso' });
  });
};

export const updateAlunoFoto = (req: Request, res: Response) => {
  const { id } = req.params;
  const { FotoPerfil } = req.body;
  db.query('UPDATE Aluno SET FotoPerfil = ? WHERE (Id = ? OR Nome = ?) = ?', [FotoPerfil, id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar foto do aluno' });
    }
    res.json({ message: 'Foto atualizada com sucesso' });
  });
}

export const deleteAluno = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('UPDATE Aluno SET Status = "Inativo" WHERE Id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao desativar aluno' });
    }
    const affectedRows = (result as import('mysql2').ResultSetHeader).affectedRows;
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json({ message: 'Aluno desativado com sucesso' });
  });
};