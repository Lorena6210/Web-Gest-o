export const fetchUsuarios = async () => {
  try {
    const response = await fetch("http://localhost:3001/login/todos");
    if (!response.ok) {
      throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Erro ao carregar usuários: URL inválida ou não disponível");
    } else {
      console.error("Erro ao carregar usuários:", error);
    }
    throw error;
  }
};