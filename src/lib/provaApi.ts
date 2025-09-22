
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


export const fetchProvas = async (idTurma: number): Promise<Prova[]> => {
  const response = await fetch(`http://localhost:3001/provas/turma/${idTurma}`);
  if (!response.ok) throw new Error("Erro ao buscar provas");
  return response.json();
}

export const fetchProva = async (idTurma: number): Promise<Prova[]> => {
  const response = await fetch(`http://localhost:3001/provas/turma/${idTurma}`);
  if (!response.ok) throw new Error("Erro ao buscar prova");
  return response.json();
}

export const fetchCriarProva = async (prova: Partial<Prova>): Promise<Prova> => {
  const response = await fetch("http://localhost:3001/provas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prova),
  });
  if (!response.ok) throw new Error("Erro ao criar prova");
  return response.json();
}

export const fetchAtualizarProva = async (id: number, prova: AtualizarProva): Promise<Prova> => {
  const response = await fetch(`http://localhost:3001/provas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prova),
  });
  if (!response.ok) throw new Error("Erro ao atualizar prova");
  return response.json();
}

export const fetchDeletarProva = async (id: number): Promise<Deletar> => {
  const response = await fetch(`http://localhost:3001/provas/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao deletar prova");
  return response.json();
}

export const fetchDetalhesProva = async (id: number): Promise<DetalhesProva> => {
  const response = await fetch(`http://localhost:3001/provas/${id}/detalhes`);
  if (!response.ok) throw new Error("Erro ao buscar detalhes da prova");
  return response.json();
}

export const fetchNotasProva = async (idProva: number): Promise<NotaProva[]> => {
  const response = await fetch(`http://localhost:3001/notas/prova/${idProva}`);
  if (!response.ok) throw new Error("Erro ao buscar notas da prova");
  return response.json();
}

export const fetchProvasPorBimestre = async (bimestre: number): Promise<Prova[]> => {
  const response = await fetch(`http://localhost:3001/provas?bimestre=${bimestre}`);
  if (!response.ok) throw new Error("Erro ao buscar provas por bimestre");
  return response.json();
}
