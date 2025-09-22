
export interface Prova {
  id: number;
  titulo: string;
  descricao?: string;
  dataCriacao?: string;
  dataEntrega?: string;
  professor?: string;
  turma?: string;
  disciplina?: string;
}

export interface NotaProva {
  id?: number;
  Id_Aluno: number;
  Id_Turma: number;
  Id_Bimestre: number;
  Id_Prova: number;
  Valor: number;
}

export interface Boletim {
  id?: number;
  Id_Aluno: number;
  Id_Disciplina: number;
  Id_Bimestre: number;
  MediaAtividades?: string;
  MediaProvas?: string;
  MediaFinalCalculada?: string;
  Situacao?: string;
  Observacoes?: string;
}

export interface DetalhesProva {
  prova: Prova;
  notas: NotaProva[];
}

export interface AtualizarProva {
  titulo?: string;
  descricao?: string;
  dataEntrega?: string;
}

export interface Deletar {
  message: string;
  deletedId: number;
}

// -------------------------
// Base URL
// -------------------------
const API_BASE = "http://localhost:3001";
// -------------------------
// Provas
// -------------------------
export const fetchProvas = async (turmaId?: number): Promise<Prova[]> => {
  const url = turmaId ? `${API_BASE}/provas/turma/${turmaId}` : `${API_BASE}/provas`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erro ao buscar provas");
  return response.json();
};

export const createProva = async (prova: Partial<Prova>): Promise<Prova> => {
  const response = await fetch(`${API_BASE}/provas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prova),
  });
  if (!response.ok) throw new Error("Erro ao criar prova");
  return response.json();
};

export const updateProva = async (id: number, prova: Partial<Prova>): Promise<void> => {
  const response = await fetch(`${API_BASE}/provas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prova),
  });
  if (!response.ok) throw new Error("Erro ao atualizar prova");
};

export const deleteProva = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/provas/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Erro ao deletar prova");
};

// Notas de Prova
export const fetchNotasProva = async (provaId: number): Promise<NotaProva[]> => {
  const response = await fetch(`${API_BASE}/provas/${provaId}/notas`);
  if (!response.ok) throw new Error("Erro ao buscar notas de prova");
  return response.json();
};

export const createNotaProva = async (provaId: number, nota: NotaProva): Promise<NotaProva> => {
  const response = await fetch(`${API_BASE}/provas/${provaId}/notas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nota),
  });
  if (!response.ok) throw new Error("Erro ao criar nota de prova");
  return response.json();
};
