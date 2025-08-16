// lib/api.ts
export const fetchProfessores = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:3001/professores/${id}`);
    if (!response.ok) {
      const text = await response.text(); // pega corpo do erro para debugar
      throw new Error(`Erro na resposta do servidor: ${response.status} - ${text}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao carregar professor:", error);
    throw error;
  }
};


export interface TurmaBasica {
  id: number;
  nome: string;
  disciplina: string;
  cor: string;
}

export interface ProfessorDataBasica {
  professor: {
    id: number;
    nome: string;
    email: string;
  };
  turmas: TurmaBasica[];
}