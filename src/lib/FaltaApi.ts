export const fetchFaltas = async () => {
  const response = await fetch("http://localhost:3001/faltas", {
    method: "GET", // Corrigido
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Erro ao buscar faltas"); // Corrigida a mensagem de erro

  return response.json();
};
