import { Request, Response } from 'express';
import pool from '../db'; // Assumindo que você tem um pool de conexões MySQL configurado
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 1. Obter todas as notas (com paginação opcional)
export const obterNotas = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query; // Paginação simples
  const offset = (Number(page) - 1) * Number(limit);

  const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    ORDER BY n.Id DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const [result] = await pool.promise().query<RowDataPacket[]>(query, [Number(limit), offset]);
    // Contagem total para paginação
      const [countResult] = await pool.promise().query<RowDataPacket[]>('SELECT COUNT(*) as total FROM Nota');
      const total = countResult[0]['total'];
    res.json({
      data: result,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
};

// 2. Obter nota por ID
export const obterNotaPorId = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID da nota é obrigatório e deve ser um número' });
  }

  const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    WHERE n.Id = ?
  `;

  try {
    const [result] = await pool.promise().query<RowDataPacket[]>(query, [Number(id)]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }
    res.json(result[0]);
  } catch (error) {
    console.error('Erro ao buscar nota por ID:', error);
    res.status(500).json({ error: 'Erro ao buscar nota por ID' });
  }
};

// 3. Obter notas por aluno (como no seu exemplo)
export const obterNotasPorAluno = async (req: Request, res: Response) => {
  const { alunoId } = req.params;

  if (!alunoId || isNaN(Number(alunoId))) {
    return res.status(400).json({ error: 'ID do aluno é obrigatório e deve ser um número' });
  }

  const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    WHERE n.Id_Aluno = ?
    ORDER BY b.Nome, n.Id
  `;

  try {
    const [result] = await pool.promise().query<RowDataPacket[]>(query, [Number(alunoId)]);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar notas por aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar notas por aluno' });
  }
};

// 4. Obter notas por disciplina
export const obterNotasPorDisciplina = async (req: Request, res: Response) => {
  const { disciplinaId } = req.params;

  if (!disciplinaId || isNaN(Number(disciplinaId))) {
    return res.status(400).json({ error: 'ID da disciplina é obrigatório e deve ser um número' });
  }

  const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    WHERE d.Id = ?
    ORDER BY al.Nome, b.Nome
  `;

  try {
    const [result] = await pool.promise().query<RowDataPacket[]>(query, [Number(disciplinaId)]);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar notas por disciplina:', error);
    res.status(500).json({ error: 'Erro ao buscar notas por disciplina' });
  }
};

// 5. Obter notas por professor (baseado em atividades/provas atribuídas ao professor)
export const obterNotasPorProfessor = async (req: Request, res: Response) => {
  const { professorId } = req.params;

  if (!professorId || isNaN(Number(professorId))) {
    return res.status(400).json({ error: 'ID do professor é obrigatório e deve ser um número' });
  }

  const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova pr ON n.Id_Prova = pr.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR pr.Id_Disciplina = d.Id)
    WHERE (a.Id_Professor = ? OR pr.Id_Professor = ?)
    ORDER BY d.Nome, al.Nome
  `;

  try {
    const [result] = await pool.promise().query<RowDataPacket[]>(query, [Number(professorId), Number(professorId)]);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar notas por professor:', error);
    res.status(500).json({ error: 'Erro ao buscar notas por professor' });
  }
};

// 6. Obter notas por turma
export const obterNotasPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params;

  if (!turmaId || isNaN(Number(turmaId))) {
    return res.status(400).json({ error: 'ID da turma é obrigatório e deve ser um número' });
  }

  const query = `
    SELECT n.*, 
           a.Titulo AS atividadeTitulo, 
           p.Titulo AS provaTitulo,
           b.Nome AS bimestreNome, 
           al.Nome AS alunoNome, 
           d.Nome AS disciplinaNome,
           t.Nome AS turmaNome
    FROM Nota n
    LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
    LEFT JOIN Prova p ON n.Id_Prova = p.Id
    JOIN Bimestre b ON n.Id_Bimestre = b.Id
    JOIN Aluno al ON n.Id_Aluno = al.Id
    JOIN Turma t ON n.Id_Turma = t.Id
    JOIN Disciplina d ON (a.Id_Disciplina = d.Id OR p.Id_Disciplina = d.Id)
    WHERE n.Id_Turma = ?
    ORDER BY al.Nome, b.Nome
  `;

  try {
    const [result] = await pool.promise().query<RowDataPacket[]>(query, [Number(turmaId)]);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar notas por turma:', error);
    res.status(500).json({ error: 'Erro ao buscar notas por turma' });
  }
};

// 7. Criar nota (suporta atividade ou prova)
export const criarNota = async (req: Request, res: Response) => {
  const { idAluno, idTurma, idBimestre, idAtividade, idProva, valor } = req.body;

  if (!idAluno || !idTurma || !idBimestre || ( !idAtividade && !idProva ) || valor === undefined || valor === null) {
    return res.status(400).json({ error: 'Campos idAluno, idTurma, idBimestre, (idAtividade OU idProva) e valor são obrigatórios' });
  }

  if (valor < 0 || valor > 10) { // Assumindo escala 0-10
    return res.status(400).json({ error: 'Valor deve estar entre 0 e 10' });
  }

  try {
    // Verifica se já existe uma nota para essa combinação (evita duplicatas)
    const checkQuery = `
      SELECT Id FROM Nota 
      WHERE Id_Aluno = ? AND Id_Turma = ? AND Id_Bimestre = ? 
      AND (Id_Atividade = ? OR Id_Prova = ?) 
      AND (Id_Atividade IS NOT NULL OR Id_Prova IS NOT NULL)
    `;
    const [checkResult] = await pool.promise().query<RowDataPacket[]>(checkQuery, [idAluno, idTurma, idBimestre, idAtividade || null, idProva || null]);
    if (checkResult.length > 0) {
      return res.status(409).json({ error: 'Nota já existe para essa combinação de aluno, turma, bimestre e avaliação' });
    }

    const sql = `
      INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Id_Prova, Valor) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.promise().query<ResultSetHeader>(sql, [idAluno, idTurma, idBimestre, idAtividade || null, idProva || null, valor]);
    res.status(201).json({ message: 'Nota criada com sucesso', insertId: result.insertId });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ error: 'Erro ao criar nota' });
  }
};

// 8. Atualizar nota (como no seu exemplo)
export const atualizarNota = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { valor } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID da nota é obrigatório e deve ser um número' });
  }
  if (valor === undefined || valor === null || valor < 0 || valor > 10) {
    return res.status(400).json({ error: 'Campo valor é obrigatório e deve estar entre 0 e 10' });
  }

  try {
    const sql = 'UPDATE Nota SET Valor = ? WHERE Id = ?';
    const [result] = await pool.promise().query<ResultSetHeader>(sql, [valor, Number(id)]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }
    res.json({ message: 'Nota atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ error: 'Erro ao atualizar nota' });
  }
};

// 9. Deletar nota (como no seu exemplo)
export const deletarNota = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID da nota é obrigatório e deve ser um número' });
  }

  try {
    const [result] = await pool.promise().query<ResultSetHeader>('DELETE FROM Nota WHERE Id = ?', [Number(id)]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }
    res.json({ message: 'Nota deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar nota:', error);
    res.status(500).json({ error: 'Erro ao deletar nota' });
  }
};

interface Nota {
  tipo: string;
  idAvaliacao: number;
  alunoId: number;
  // other properties...
}

// Função sem transações: Usa pool.promise().query() para cada operação
export const lançarNotasEmMassa = async (req: Request, res: Response) => {
  const { avaliacoes, notas } = req.body;

  // Validações (mesmas de antes)
  if (!avaliacoes || !Array.isArray(avaliacoes) || avaliacoes.length === 0) {
    return res.status(400).json({ error: 'Campo "avaliacoes" obrigatório' });
  }
  if (!notas || !Array.isArray(notas) || notas.length === 0) {
    return res.status(400).json({ error: 'Campo "notas" obrigatório' });
  }

  const notasInseridas: Nota[] = [];
  let totalInseridas = 0;
  let totalDuplicadas = 0;

  try {
    for (const avaliacao of avaliacoes) {
      const { tipo, id: idAvaliacao } = avaliacao;

      if (!tipo || !['atividade', 'prova'].includes(tipo) || !idAvaliacao) {
        return res.status(400).json({ error: 'Avaliação inválida' });
      }

      // Valida avaliação no BD
      let avaliacaoQuery: string;
      if (tipo === 'atividade') {
        avaliacaoQuery = `SELECT a.Id AS idAvaliacao, a.Id_Turma, a.Id_Disciplina, a.Id_Bimestre, d.Nome AS disciplinaNome FROM Atividade a JOIN Disciplina d ON a.Id_Disciplina = d.Id JOIN Turma t ON a.Id_Turma = t.Id WHERE a.Id = ?`;
      } else {
        avaliacaoQuery = `SELECT pr.Id AS idAvaliacao, pr.Id_Turma, pr.Id_Disciplina, pr.Id_Bimestre, d.Nome AS disciplinaNome FROM Prova pr JOIN Disciplina d ON pr.Id_Disciplina = d.Id JOIN Turma t ON pr.Id_Turma = t.Id WHERE pr.Id = ?`;
      }

      const [avaliacaoResult] = await pool.promise().query<RowDataPacket[]>(avaliacaoQuery, [Number(idAvaliacao)]);
      if (avaliacaoResult.length === 0) {
        return res.status(400).json({ error: `${tipo} não encontrada` });
      }
      const avaliacaoDb = avaliacaoResult[0];
      const idTurma = avaliacaoDb.idAvaliacao;  // Ajuste os nomes se necessário
      const idDisciplina = avaliacaoDb.Id_Disciplina;
      const idBimestre = avaliacaoDb.Id_Bimestre;

      // Filtra e processa notas (similar à opção 1, mas com pool.promise().query())
      const notasParaAvaliacao = notas.filter((n: Nota) => n.tipo === tipo && n.idAvaliacao === Number(idAvaliacao));
      for (const notaInput of notasParaAvaliacao) {
        const { alunoId, valor } = notaInput;

        // Valida aluno (usando pool.promise())
        const [alunoResult] = await pool.promise().query<RowDataPacket[]>(
          `SELECT 1 FROM Aluno_Turma WHERE Id_Aluno = ? AND Id_Turma = ? AND Status = 'Ativo'`,
          [Number(alunoId), idTurma]
        );
        if (alunoResult.length === 0) {
          totalDuplicadas++;
          continue;
        }

        // Verifica duplicata
        const campo = tipo === 'atividade' ? 'Id_Atividade' : 'Id_Prova';
        const [duplicataResult] = await pool.promise().query<RowDataPacket[]>(
          `SELECT Id FROM Nota WHERE Id_Aluno = ? AND Id_Turma = ? AND Id_Bimestre = ? AND ${campo} = ?`,
          [Number(alunoId), idTurma, idBimestre, Number(idAvaliacao)]
        );
        if (duplicataResult.length > 0) {
          totalDuplicadas++;
          continue;
        }

        // Insere (sem transação)
        const [insertResult] = await pool.promise().query<ResultSetHeader>(
          `INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, ${campo}, Valor) VALUES (?, ?, ?, ?, ?)`,
          [Number(alunoId), idTurma, idBimestre, Number(idAvaliacao), Number(valor)]
        );
        notasInseridas.push({ ...notaInput, idTurma, idDisciplina, idBimestre, id: insertResult.insertId });
        totalInseridas++;

        // Atualiza boletim
        await pool.promise().query(`CALL CalcularMediaBoletim(?, ?, ?)`, [Number(alunoId), idDisciplina, idBimestre]);
      }
    }

    res.status(201).json({
      message: `Sucesso! ${totalInseridas} notas inseridas.`,
      resumo: { totalInseridas, totalDuplicadasOuInvalidas: totalDuplicadas },
      notasInseridas
    });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao inserir notas' });
  }
};
