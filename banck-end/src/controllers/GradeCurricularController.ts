import { Request, Response } from 'express';
import pool from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';


export const listarProfessoresPorGradeEDisciplina = async (req: Request, res: Response) => {
  const { idGradeCurricular, idDisciplina } = req.params;

  if (!idGradeCurricular || !idDisciplina) {
    return res.status(400).json({ error: 'idGradeCurricular e idDisciplina são obrigatórios' });
  }

  try {
    const sql = `
      SELECT 
        p.Id AS Id_Professor,
        p.Nome AS Nome_Professor,
        t.Id AS Id_Turma,
        t.Nome AS Nome_Turma,
        gd.Id AS Id_GradeDisciplina,
        d.Nome AS Nome_Disciplina,
        gc.Id AS Id_GradeCurricular,
        gc.Codigo AS Codigo_GradeCurricular
      FROM Professor p
      JOIN Professor_Turma_Disciplina ptd ON p.Id = ptd.Id_Professor
      JOIN Turma t ON ptd.Id_Turma = t.Id
      JOIN GradeCurricular gc ON t.Id_GradeCurricular = gc.Id
      JOIN GradeDisciplina gd ON gd.Id_GradeCurricular = gc.Id AND gd.Id_Disciplina = ptd.Id_Disciplina
      JOIN Disciplina d ON gd.Id_Disciplina = d.Id
      WHERE gc.Id = ? AND gd.Id_Disciplina = ?
      ORDER BY p.Nome, t.Nome;
    `;

    const [rows] = await pool.promise().query<RowDataPacket[]>(sql, [idGradeCurricular, idDisciplina]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum professor encontrado para essa grade curricular e disciplina' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar professores por grade curricular e disciplina:', error);
    res.status(500).json({ error: 'Erro ao listar professores por grade curricular e disciplina' });
  }
};



// Criar disciplina na grade
export const criarDisciplinaNaGrade = async (req: Request, res: Response) => {
  const { idTurma, idProfessor, idDisciplina, semestre, cargaHoraria, obrigatoria = true, ordem, descricao } = req.body;

  if (!idTurma || !idProfessor || !idDisciplina || !semestre || !cargaHoraria) {
    return res.status(400).json({ error: 'idTurma, idProfessor, idDisciplina, semestre e cargaHoraria são obrigatórios' });
  }

  try {
    // 1. Buscar a grade da turma
    const [turmaRows] = await pool.promise().query<RowDataPacket[]>(
      'SELECT Id_GradeCurricular FROM Turma WHERE Id = ?',
      [idTurma]
    );

    if (turmaRows.length === 0) {
      return res.status(400).json({ error: 'Turma não encontrada ou sem grade curricular associada' });
    }

    const idGradeCurricular = turmaRows[0].Id_GradeCurricular;

    // 2. Inserir na GradeDisciplina se não existir
    const [existingGradeDisciplina] = await pool.promise().query<RowDataPacket[]>(
      'SELECT Id FROM GradeDisciplina WHERE Id_GradeCurricular = ? AND Id_Disciplina = ?',
      [idGradeCurricular, idDisciplina]
    );

    if (existingGradeDisciplina.length === 0) {
      await pool.promise().query<ResultSetHeader>(
        `INSERT INTO GradeDisciplina 
          (Id_GradeCurricular, Id_Disciplina, Obrigatoria, CargaHoraria, Semestre, Ordem, Descricao) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idGradeCurricular, idDisciplina, obrigatoria, cargaHoraria, semestre, ordem || null, descricao || null]
      );
    }

    // 3. Inserir vínculo Professor_Turma_Disciplina
    const [existingPTD] = await pool.promise().query<RowDataPacket[]>(
      'SELECT Id FROM Professor_Turma_Disciplina WHERE Id_Professor = ? AND Id_Turma = ? AND Id_Disciplina = ?',
      [idProfessor, idTurma, idDisciplina]
    );

    if (existingPTD.length > 0) {
      return res.status(400).json({ error: 'Essa disciplina já está vinculada a esse professor e turma' });
    }

    const [insertResult] = await pool.promise().query<ResultSetHeader>(
      `INSERT INTO Professor_Turma_Disciplina 
        (Id_Professor, Id_Turma, Id_Disciplina, Status, DataInicio) 
       VALUES (?, ?, ?, 'Ativo', CURDATE())`,
      [idProfessor, idTurma, idDisciplina]
    );

    res.status(201).json({ message: 'Disciplina vinculada com sucesso', id: insertResult.insertId });
  } catch (error) {
    console.error('Erro ao criar disciplina na grade:', error);
    res.status(500).json({ error: 'Erro ao criar disciplina na grade' });
  }
};

//  Criar grade curricular com bimestre
export const criarDisciplinaNaGradeComBimestre = async (req: Request, res: Response) => {
  const {
    idTurma,
    idProfessor,
    idDisciplina,
    semestre,
    cargaHoraria,
    obrigatoria = true,
    ordem,
    descricao,
    bimestre // NOVO CAMPO
  } = req.body;

  if (!idTurma || !idProfessor || !idDisciplina || !semestre || !cargaHoraria) {
    return res.status(400).json({ error: 'idTurma, idProfessor, idDisciplina, semestre e cargaHoraria são obrigatórios' });
  }

  try {
    // Buscar a grade da turma
    const [turmaRows] = await pool.promise().query<RowDataPacket[]>(
      'SELECT Id_GradeCurricular FROM Turma WHERE Id = ?',
      [idTurma]
    );

    if (turmaRows.length === 0) {
      return res.status(400).json({ error: 'Turma não encontrada ou sem grade curricular associada' });
    }

    const idGradeCurricular = turmaRows[0].Id_GradeCurricular;

    // Inserir na GradeDisciplina se não existir
    const [existingGradeDisciplina] = await pool.promise().query<RowDataPacket[]>(
      'SELECT Id FROM GradeDisciplina WHERE Id_GradeCurricular = ? AND Id_Disciplina = ?',
      [idGradeCurricular, idDisciplina]
    );

    if (existingGradeDisciplina.length === 0) {
      await pool.promise().query<ResultSetHeader>(
        `INSERT INTO GradeDisciplina
          (Id_GradeCurricular, Id_Disciplina, Obrigatoria, CargaHoraria, Semestre, Ordem, Descricao, Bimestre)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [idGradeCurricular, idDisciplina, obrigatoria, cargaHoraria, semestre, ordem || null, descricao || null, bimestre || null]
      );
    }

    // Inserir vínculo Professor_Turma_Disciplina
    const [existingPTD] = await pool.promise().query<RowDataPacket[]>(
      'SELECT Id FROM Professor_Turma_Disciplina WHERE Id_Professor = ? AND Id_Turma = ? AND Id_Disciplina = ?',
      [idProfessor, idTurma, idDisciplina]
    );

    if (existingPTD.length > 0) {
      return res.status(400).json({ error: 'Essa disciplina já está vinculada a esse professor e turma' });
    }

    const [insertResult] = await pool.promise().query<ResultSetHeader>(
      `INSERT INTO Professor_Turma_Disciplina
        (Id_Professor, Id_Turma, Id_Disciplina, Status, DataInicio)
       VALUES (?, ?, ?, 'Ativo', CURDATE())`,
      [idProfessor, idTurma, idDisciplina]
    );

    res.status(201).json({ message: 'Disciplina vinculada com sucesso', id: insertResult.insertId });
  } catch (error) {
    console.error('Erro ao criar disciplina na grade:', error);
    // Adicione o erro real na resposta para debug (remova em produção)
    res.status(500).json({ error: 'Erro ao criar disciplina na grade', details: error instanceof Error ? error.message : error });
  }
};


// Remover disciplina da grade
export const removerDisciplinaDaGrade = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const sql = 'DELETE FROM GradeDisciplina WHERE Id = ?';
    const [result] = await pool.promise().query<ResultSetHeader>(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Disciplina da grade não encontrada' });
    }

    res.json({ message: 'Disciplina removida da grade com sucesso' });
  } catch (error) {
    console.error('Erro ao remover disciplina da grade:', error);
    res.status(500).json({ error: 'Erro ao remover disciplina da grade' });
  }
};

// Atualizar grade curricular
export const atualizarGradeCurricular = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Body da requisição não enviado" });
  }

  const { Id_Curso, AnoInicio, AnoFim, Descricao } = req.body;

  if (!Id_Curso || !AnoInicio) {
    return res.status(400).json({ error: "Id_Curso e AnoInicio são obrigatórios" });
  }

  try {
    const sql = `
      UPDATE GradeCurricular
      SET Id_Curso = ?, AnoInicio = ?, AnoFim = ?, Descricao = ?
      WHERE Id = ?
    `;
    const [result] = await pool.promise().query<ResultSetHeader>(
      sql,
      [Id_Curso, AnoInicio, AnoFim || null, Descricao || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Grade curricular não encontrada" });
    }

    res.json({ message: "Grade curricular atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar grade curricular:", error);
    res.status(500).json({
      error: "Erro ao atualizar grade curricular",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

// Deletar grade curricular
export const deletarGradeCurricular = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    // Remover vínculos em Professor_Turma_Disciplina
    await pool.promise().query(
      `DELETE FROM Professor_Turma_Disciplina 
       WHERE Id_Turma IN (SELECT Id FROM Turma WHERE Id_GradeCurricular = ?)`,
      [id]
    );

    // Remover disciplinas da grade
    await pool.promise().query(
      'DELETE FROM GradeDisciplina WHERE Id_GradeCurricular = ?',
      [id]
    );

    // Remover turmas associadas
    await pool.promise().query(
      'DELETE FROM Turma WHERE Id_GradeCurricular = ?',
      [id]
    );

    // Agora remover a grade curricular
    const [result] = await pool.promise().query<ResultSetHeader>(
      'DELETE FROM GradeCurricular WHERE Id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Grade curricular não encontrada' });
    }

    res.json({ message: 'Grade curricular deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar grade curricular:', error);
    res.status(500).json({
      error: 'Erro ao deletar grade curricular',
      details: error instanceof Error ? error.message : error,
    });
  }
};



export const listarGradeComDisciplinas = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { bimestre } = req.query; // opcional, 1,2,3,4

  try {
    const sql = `
      SELECT 
        gc.Id AS Id_GradeCurricular,
        gc.Codigo AS Codigo_Grade,
        gc.Id_Curso,
        gc.AnoInicio,
        gc.AnoFim,
        gc.Descricao AS Descricao_Grade,
        gd.Id AS Id_GradeDisciplina,
        d.Nome AS Nome_Disciplina,
        gd.Semestre,
        gd.Ordem,
        gd.CargaHoraria,
        gd.Obrigatoria,
        gd.Bimestre
      FROM GradeCurricular gc
      LEFT JOIN GradeDisciplina gd ON gd.Id_GradeCurricular = gc.Id
      LEFT JOIN Disciplina d ON gd.Id_Disciplina = d.Id
      WHERE gc.Id = ?
      ${bimestre ? 'AND gd.Bimestre = ?' : ''}
      ORDER BY gd.Bimestre, gd.Semestre, gd.Ordem
    `;

    const params: (string | number)[] = [id];
    if (bimestre) params.push(Number(bimestre));

    const [rows] = await pool.promise().query<RowDataPacket[]>(sql, params);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Grade curricular ou disciplinas não encontradas' });
    }

    // Agrupar disciplinas dentro da grade
    const grade = {
      Id_GradeCurricular: rows[0].Id_GradeCurricular,
      Codigo_Grade: rows[0].Codigo_Grade,
      Id_Curso: rows[0].Id_Curso,
      AnoInicio: rows[0].AnoInicio,
      AnoFim: rows[0].AnoFim,
      Descricao_Grade: rows[0].Descricao_Grade,
      Disciplinas: rows
        .filter(r => r.Id_GradeDisciplina) // remove linhas sem disciplina
        .map(d => ({
          Id_GradeDisciplina: d.Id_GradeDisciplina,
          Nome_Disciplina: d.Nome_Disciplina,
          Semestre: d.Semestre,
          Ordem: d.Ordem,
          CargaHoraria: d.CargaHoraria,
          Obrigatoria: !!d.Obrigatoria,
          Bimestre: d.Bimestre
        }))
    };

    res.json(grade);
  } catch (error) {
    console.error('Erro ao listar grade com disciplinas:', error);
    res.status(500).json({ 
      error: 'Erro ao listar grade com disciplinas', 
      details: error instanceof Error ? error.message : error 
    });
  }
};

// Listar todas as grades curriculares com código e turma
export const listarGradesCurriculares = async (_req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        gc.Id,
        gc.Codigo AS Codigo_Grade,
        gc.Id_Curso,
        gc.AnoInicio,
        gc.AnoFim,
        gc.Descricao,
        t.Id AS Id_Turma,
        t.Nome AS Nome_Turma
      FROM GradeCurricular gc
      LEFT JOIN Turma t ON t.Id_GradeCurricular = gc.Id
      ORDER BY gc.AnoInicio DESC, t.Nome;
    `;

    const [rows] = await pool.promise().query<RowDataPacket[]>(sql);

    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar grades curriculares:', error);
    res.status(500).json({ error: 'Erro ao listar grades curriculares' });
  }
};
