// lib/api.ts

export interface ProfessorDataBasica {
  id: number;
  nome: string;
  email: string;
  senha: string;
  disciplina?: string | null;
  genero?: string | null;
  status?: string;
  fotoPerfil?: string | null;
}

export interface Atividade {
  id: number;
  titulo: string;
  descricao?: string | null;
  dataCriacao?: string;
  dataEntrega?: string;
  professor?: string;
  turma?: string;
  disciplina?: string;
  turmaId?: number;
}

export interface NotaAtividade {
  id?: number;
  Id_Aluno: number;
  Id_Turma: number;
  Id_Bimestre: number;
  Id_Atividade: number;
  Valor: number;
}

export interface Bimestre{
  id: number;
  nome: string;
  dataInicio: string;
  dataFim: string;
  status: string;
}

const API_BASE = "http://localhost:3001";

// -------------------------
//  Atividades
// -------------------------

// GET /atividades
export const fetchAtividades = async (id:number): Promise<Atividade[]> => {
  const response = await fetch(`${API_BASE}/atividades?bimestre=${id}`);
  if (!response.ok) throw new Error("Erro ao buscar atividades");
  return response.json();
};

// POST /atividades
export const createAtividade = async (atividade: Partial<Atividade>): Promise<Atividade> => {
  const response = await fetch(`${API_BASE}/atividades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(atividade),
  });
  if (!response.ok) throw new Error("Erro ao criar atividade");
  return response.json();
};

// PUT /atividades/:id
export const updateAtividade = async (id: number, atividade: Partial<Atividade>): Promise<void> => {
  const response = await fetch(`${API_BASE}/atividades/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(atividade),
  });
  if (!response.ok) throw new Error("Erro ao atualizar atividade");
};

// DELETE /atividades/:id
export const deleteAtividade = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/atividades/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao deletar atividade");
};

// -------------------------
// Notas de Atividade
// -------------------------

// GET /atividades/:atividadeId/notas
export const fetchNotasAtividade = async (atividadeId: number): Promise<NotaAtividade[]> => {
  const response = await fetch(`${API_BASE}/atividades/${atividadeId}/notas`);
  if (!response.ok) throw new Error("Erro ao buscar notas da atividade");
  return response.json();
};

// POST /atividades/:atividadeId/notas
export const createNotaAtividade = async (atividadeId: number, nota: NotaAtividade): Promise<NotaAtividade> => {
  const response = await fetch(`${API_BASE}/atividades/${atividadeId}/notas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nota),
  });
  if (!response.ok) throw new Error("Erro ao criar nota da atividade");
  return response.json();
};
