// lib/AlunoApi.ts

export interface Aluno {
  Nome: string;
  CPF: string;
  Senha: string;
  Telefone: string;
  DataNascimento: string;
  Genero: string;
  FotoPerfil: string;
  Status: string;
  RA: string;
}

export const fetchAlunos = async (): Promise<Aluno[]> => {
  try {
    const response = await fetch("http://localhost:3000/alunos", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error("Erro ao buscar alunos");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    throw error;
  }
};


export const createAluno = async (aluno: Aluno) => {
  try {
    const response = await fetch("http://localhost:3000/alunos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aluno),
    });
    if (!response.ok) {
      throw new Error("Erro ao cadastrar aluno");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao criar aluno:", error);
    throw error;
  }
};

