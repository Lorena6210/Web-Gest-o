// src/lib/Responsaveis.ts

export interface Aluno {
  Id: number;
  Nome: string;
  RA: string;
  Id_Responsavel: number;
  [key: string]: string | number; // Specify a type for the index signature
}

export  interface ResponsavelComAlunos {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  alunos: Aluno[];
}

 export interface Responsavel {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
}

// Buscar um responsável pelo ID
export const fetchResponsaveis = async (id: number): Promise<Responsavel> => {
  try {
    const response = await fetch(`http://localhost:3001/responsaveis/${id}`);
    if (!response.ok) {
      throw new Error("Erro na resposta do servidor");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao carregar responsável:", error);
    throw error;
  }
};

// Buscar os alunos de um responsável
export const fetchResponsaveisAluno = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:3001/responsaveis/${id}/alunos`);

    // Se 404, retornamos array vazio
    if (response.status === 404) {
      console.warn(`Responsável ${id} não encontrado ou sem alunos.`);
      return [];
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro do servidor:", text);
      throw new Error(`Erro na resposta do servidor: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erro ao carregar alunos do responsável:", error);
    return []; // Retorna array vazio em caso de qualquer erro
  }
};

// Criar um novo responsável
export const createResponsavel = async (responsavel: Responsavel): Promise<Responsavel> => {
  try {
    const response = await fetch(`http://localhost:3001/responsaveis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responsavel),
    });
    if (!response.ok) {
      throw new Error("Erro na resposta do servidor");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao criar responsável:", error);
    throw error;
  }
};


// Atualizar um responsável (PUT)
export const updateResponsavel = async (id: number, responsavel: Responsavel): Promise<Responsavel> => {
  try {
    const response = await fetch(`http://localhost:3001/responsaveis/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responsavel),
    });
    if (!response.ok) {
      throw new Error("Erro na resposta do servidor");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao atualizar responsável:", error);
    throw error;
  }
};

// Atualizar parcialmente um responsável (PATCH)
export const patchResponsavel = async (id: number, responsavel: Partial<Responsavel>): Promise<Responsavel> => {
  try {
    const response = await fetch(`http://localhost:3001/responsaveis/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responsavel),
    });
    if (!response.ok) {
      throw new Error("Erro na resposta do servidor");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao atualizar parcialmente responsável:", error);
    throw error;
  }
};

// Deletar um responsável
export const deleteResponsavel = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:3001/responsaveis/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Erro na resposta do servidor");
    }
    return true;
  } catch (error) {
    console.error("Erro ao deletar responsável:", error);
    throw error;
  }
};

