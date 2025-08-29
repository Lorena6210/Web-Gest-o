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
    if (!response.ok) throw new Error("Erro ao buscar alunos");
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
      const errMsg = await response.json();
      throw new Error(errMsg.error || "Erro ao cadastrar aluno");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao criar aluno:", error);
    throw error;
  }
};


export const updateAluno = async (aluno: Aluno) => {
  try {
    const response = await fetch(`http://localhost:3000/alunos/${aluno.RA}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aluno),
    });
    if (!response.ok) throw new Error("Erro ao atualizar aluno");
    return await response.json();
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    throw error;
  }
};

export const deleteAluno = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:3000/alunos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar aluno");
    return await response.json();
  } catch (error) {
    console.error("Erro ao deletar aluno:", error);
    throw error;
  }
};