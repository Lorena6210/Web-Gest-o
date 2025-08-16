import type { Request, Response } from 'express';
import db from '../db';

export const getProfessores = (req: Request, res: Response) => {
  db.query('SELECT * FROM Professor WHERE Status = "Ativo"', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar professores' });
    }

    res.status(200).json(results);
  });
};


export const getProfessorById = (req: Request, res: Response) => {
  const { id } = req.params;

  const queryExata = `
    SELECT * FROM Professor 
    WHERE (Id = ? OR Nome = ? OR Email = ?) 
    AND Status = 'Ativo'
  `;

  db.query(queryExata, [id, id, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar professor' });

    if (Array.isArray(results) && results.length > 0) {
      return res.status(200).json(results);
    }

    // Busca aproximada por nome ou email se não encontrar exatamente
    const queryAproximada = `
      SELECT * FROM Professor 
      WHERE (Nome LIKE ? OR Email LIKE ?) 
      AND Status = 'Ativo'
    `;

    db.query(queryAproximada, [`%${id}%`, `%${id}%`], (err2, sugestoes) => {
      if (err2) return res.status(500).json({ error: 'Erro ao buscar professor (sugestão)' });

      if (Array.isArray(sugestoes) && sugestoes.length > 0) {
        return res.status(404).json({
          error: 'Professor não encontrado exatamente, mas aqui estão sugestões:',
          sugestoes
        });
      }

      res.status(404).json({ error: 'Professor não encontrado' });
    });
  });
};

export const createProfessor = (req: Request, res: Response) => {
  const { Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, FormacaoAcademica, Status } = req.body;

  console.log('Dados recebidos no corpo:', req.body);

  const query = `
    INSERT INTO Professor
      (Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, FormacaoAcademica, Status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

db.query(
  query,
  [Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil || null, FormacaoAcademica || null, Status || 'Ativo'],
  (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar professor:', err);
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'CPF ou Email já cadastrado' });
      }
      return res.status(500).json({ error: 'Erro ao cadastrar professor' });
    }

    const insertId = (result as import('mysql2').ResultSetHeader).insertId;
    console.log(' Insert realizado, ID =', insertId);

    res.status(201).json({
      message: 'Professor cadastrado com sucesso',
      id: insertId
    });
  }
);
};

export const updateProfessor = (req: Request, res: Response) => {
  const { id } = req.params;
  const { Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, FormacaoAcademica, Status } = req.body;

  db.query('UPDATE Professor SET Nome = ?, CPF = ?, Email = ?, Senha = ?, Telefone = ?, DataNascimento = ?, Genero = ?, FotoPerfil = ?, FormacaoAcademica = ?, Status = ? WHERE Id = ?', 
  [Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, FotoPerfil, FormacaoAcademica, Status, id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar professor' });
    }
    res.json({ message: 'Professor atualizado com sucesso' });
  });
};

export const updateProfessorFoto = (req: Request, res: Response) => {
  const { id } = req.params;
  const { FotoPerfil } = req.body;
  db.query('UPDATE Professor SET FotoPerfil = ? WHERE Id = ?', [FotoPerfil, id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar foto do professor' });
    }
    res.json({ message: 'Foto atualizada com sucesso' });
  });
};

export const activateProfessor = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('CALL Ativar_ProfessorSET Status = "Ativo" WHERE (Id = ? OR Nome = ?) ', [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao ativar professor', details: err.message });
    }
    res.json({ message: 'Professor ativado com sucesso' });
  });
};

export const deleteProfessor = (req: Request, res: Response) => {
  const { id } = req.params;
  db.query('CALL Desativar_Professor(?)', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao desativar professor' });
    }
    res.json({ message: 'Professor desativado com sucesso' });
  });
};
