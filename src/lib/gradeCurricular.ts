export interface GradeCurricular {
  Id_GradeCurricular: any;
  Id_Professor: number;
  Bimestre: number;
  Descricao_Grade: string | undefined;
  CargaHoraria: number;
  Semestre: number;
  Codigo_Disciplina: string;
  Nome_Disciplina: string;
  Id_Disciplina: number;
  Id: number;
  Codigo_Grade: string | null;
  Id_Curso: number;
  AnoInicio: number;
  AnoFim: number | null;
  Descricao: string;
  Id_Turma: number | null;
  Nome_Turma: string | null;
  Disciplinas: Disciplina[];
}

export interface GradeDisciplina {
  Id: number;
  Nome_Disciplina: string;
  Semestre: number;
  CargaHoraria: number;
  Creditos: number;
  Obrigatoria: boolean;
  Ordem: number;
}

export interface Disciplina {
  Descricao: string;
  Id: number;
  Nome: string;
  Codigo: string;
  CargaHoraria: number;
}

// Buscar todas as grades curriculares
export const fetchGradesCurriculares = async (): Promise<GradeCurricular[]> => {
 const response = await fetch("http://localhost:3001/grade-curricular", {
    method: "GET", // Corrigido
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Erro ao buscar Grade Curricular"); // Corrigida a mensagem de erro

  return response.json();
};


// Criar nova grade
export const createGradeCurricular = async (grade: Partial<GradeCurricular>): Promise<GradeCurricular> => {
  const res = await fetch("http://localhost:3001/grade-curricular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(grade),
  });
  if (!res.ok) throw new Error("Erro ao criar grade curricular");
  return res.json();
};

// Atualizar grade
export const updateGradeCurricular = async (id: number, grade: Partial<GradeCurricular>): Promise<GradeCurricular> => {
  const res = await fetch(`http://localhost:3001/grade-curricular/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(grade),
  });
  if (!res.ok) throw new Error("Erro ao atualizar grade curricular");
  return res.json();
};

// Deletar grade
export const deleteGradeCurricular = async (id: number): Promise<void> => {
  const res = await fetch(`http://localhost:3001/grade-curricular/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao deletar grade curricular");
};


export const fetchProfessoresPorGradeEDisciplina = async (idGrade: number, idDisciplina: number): Promise<Disciplina[]> => {
  const res = await fetch(`http://localhost:3001/grade-curricular/${idGrade}/disciplinas/${idDisciplina}/professores`);
  if (!res.ok) throw new Error("Erro ao buscar professores por grade e disciplina");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
