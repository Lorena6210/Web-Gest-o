
// lib/api.ts
export const fetchUsuarios = async () => {
  try {
    const response = await fetch("http://localhost:3000/login/todos");
    if (!response.ok) {
      throw new Error("Erro na resposta do servidor");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    throw error;
  }
};

