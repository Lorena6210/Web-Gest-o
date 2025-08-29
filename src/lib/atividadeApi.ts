// lib/api.ts
export const fetchAlunos = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:3000/atividades/${id}`);
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
