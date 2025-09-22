// lib/api.ts
import { TurmaCompleta } from "@/Types/Turma";

export interface ProfessorDataBasica {
  professor: {
    id: number;
    nome: string;
    email: string;
  };
  id: number;
  nome: string;
  email: string;
  turmas: TurmaCompleta[];
}

export const fetchProfessores = async () => {
  try {
    const response = await fetch(`http://localhost:3001/professores`);
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


export const fetchPequisaProfessores = async (id: number) => {
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

export const fetchGestores = async () => {
  try {
    const response = await fetch(`http://localhost:3001/responsaveis`);
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

export const fetchCreateProfessor = async (professor: ProfessorDataBasica) => {
  try {
    const response = await fetch("http://localhost:3001/professores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(professor),
    });
    if (!response.ok) throw new Error("Erro ao criar professor");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar professor:", error);
    throw error;
  }
}

export const fetchUpdateProfessor = async (professor: ProfessorDataBasica) => {
  try {
    const response = await fetch(`http://localhost:3001/professores/${professor.professor.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(professor),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao atualizar professor:", error);
    throw error;
  }
}

export const fetchDeleteProfessor = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:3001/professores/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar professor");
    return await response.json();
  } catch (error) {
    console.error("Erro ao deletar professor:", error);
    throw error;
  }
}


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
  turmas: TurmaCompleta[];
}