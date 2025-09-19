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
  turmaId: number;
  nome: string;
}

export const fetchAtividades = async (): Promise<Atividade[]> => {
  try {
    const response = await fetch(`http://localhost:3001/atividades`);
    if (!response.ok) {
      throw new Error("Erro na resposta do servidor");
    }
    const data = await response.json();
    return data; // espera um objeto professor com turmas
  } catch (error) {
    console.error("Erro ao carregar professor:", error);
    throw error;
  }
};

