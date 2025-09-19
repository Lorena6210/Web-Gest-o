interface GradeCurricular {
  Id_Turma?: number;
  Nome_Turma?: string;
  Id_Disciplina: number;
  Codigo_Disciplina: string;
  Nome_Disciplina: string;
  Credito?: number | null;
  Id_Professor: number;
  Nome_Professor: string;
  Semestre: number;
  CargaHoraria?: number;
  Obrigatoria?: boolean;
  Ordem?: number;
}


export interface Professor {
  id: number;
  nome: string;
  email: string;
}

export const fetchGradeCurricular = async (
  idTurma: number,
  idProfessor: number
): Promise<GradeCurricular[]> => {
  try {
    const response = await fetch(
      `http://localhost:3001/grade-curricular/disciplinas/${idTurma}/${idProfessor}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    // Garante que seja array
    return Array.isArray(data) ? data : data ? [data] : [];
  } catch (error) {
    console.error("Erro ao buscar grade curricular:", error);
    return [];
  }
};
