export interface Prova {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataEntrega: string;
  professor: string;
  turma: string;
  disciplina: string;
}

export const fetchProva = async (turmaId: number): Promise<Prova[]> => {
  try {
    const response = await fetch(`http://localhost:3001/provas/turma/${turmaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar provas");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar provas:", error);
    throw error;
  }
};
