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

// Interface genérica para Nota
export interface Nota {
  Id?: number;
  Id_Aluno: number;
  Id_Turma: number;
  Id_Bimestre: number;
  Valor: number;
  Id_Atividade?: number;
  Id_Prova?: number;
}

export interface Aluno {
  Id: number;
  Nome: string;
  Email: string;
  Tipo: string;
}

export interface Disciplina {
  Id: number;
  Nome: string;
  Codigo: string;
  CargaHoraria: number;
}

//  NOTAS
export const fetchCreateOrUpdateNotaAtividade = async (nota: Nota) => {
  const response = await fetch("http://localhost:3001/notas/atividade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nota),
  });
  if (!response.ok) throw new Error("Erro ao salvar nota de atividade");
  return response.json();
};

export const fetchCreateOrUpdateNotaProva = async (nota: Nota) => {
  const response = await fetch("http://localhost:3001/notas/prova", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nota),
  });
  if (!response.ok) throw new Error("Erro ao salvar nota de prova");
  return response.json();
};

export const fetchGetNotasPorAlunoDisciplinaBimestre = async (
  idAluno: number,
  idDisciplina: number,
  idBimestre: number
) => {
  const response = await fetch(
    `http://localhost:3001/notas/${idAluno}/${idDisciplina}/${idBimestre}`
  );
  if (!response.ok) throw new Error("Erro ao buscar notas");
  return response.json();
};

//  BOLETINS
export const fetchGetBoletins = async (): Promise<Boletim[]> => {
  const response = await fetch("http://localhost:3001/boletim");
  if (!response.ok) throw new Error("Erro ao buscar boletins");
  return response.json();
};

export const fetchCreateOrUpdateBoletim = async (
  boletim: Partial<Boletim>
): Promise<Boletim> => {
  const response = await fetch("http://localhost:3001/boletim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(boletim),
  });
  if (!response.ok) throw new Error("Erro ao salvar boletim");
  return response.json();
};

export const fetchGetBoletimPorAluno = async (
  idAluno: number
): Promise<Boletim[]> => {
  const response = await fetch(
    `http://localhost:3001/boletim/aluno/${idAluno}`
  );
  if (!response.ok) throw new Error("Erro ao buscar boletim do aluno");
  return response.json();
};
