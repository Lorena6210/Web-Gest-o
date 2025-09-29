
export interface notas{
  Id: number;
  Id_Aluno: number;
  Id_Turma: number;
  Id_Bimestre: number;
  Valor: string; // está vindo como string no JSON ("9.50")
  Id_Atividade: number | null;
  Id_Prova: number | null;
  TipoNota: "Normal" | "Recuperação" | string; // pode refinar se souber os valores possíveis
  atividadeTitulo: string | null;
  provaTitulo: string | null;
  bimestreNome: string;
  alunoNome: string;
  disciplinaNome: string;
  turmaNome: string;
}

// Buscar todas as grades curriculares
export const  fetchNotas = async (): Promise<notas[]> => {
 const response = await fetch("http://localhost:3001/notas", {
    method: "GET", // Corrigido
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Erro ao buscar Grade Curricular"); // Corrigida a mensagem de erro

  return response.json();
};


// Criar nova grade
export const createNotas = async (grade: Partial<notas>): Promise<notas> => {
  const res = await fetch("http://localhost:3001/notas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(grade),
  });
  if (!res.ok) throw new Error("Erro ao criar grade curricular");
  return res.json();
};
