// lib/disciplinaApi.ts

export interface Disciplina {
  Id: number;
  Nome: string;
  Codigo: string;
  CargaHoraria: number;
}

export const fetchDisciplinas = async (): Promise<Disciplina[]> => {
  try {
    const response = await fetch("http://localhost:3000/disciplinas", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Erro ao buscar disciplinas");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar disciplinas:", error);
    throw error;
  }
};
