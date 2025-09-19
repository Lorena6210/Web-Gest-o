export interface Boletim {
  id: number;
  Id_Aluno: number;
  Id_Disciplina: number;
  Id_Bimestre:number;
  MediaAtividades: string,
  MediaProvas: string,
  MediaFinalCalculada: string; 
  Situacao: string;
  Observacoes: string;
}


export const fetchGetBoletim = async (): Promise<Boletim> => {
  try {
    const response = await fetch("http://localhost:3001/Boletim");
    if (!response.ok) throw new Error("Erro ao buscar boletim");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar boletim:", error);
    throw error;
  }
};

export const fetchCreateBoletim = async (boletim: Boletim): Promise<Boletim> => {
  try {
    const response = await fetch("http://localhost:3001/Boletim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(boletim),
    });
    if (!response.ok) throw new Error("Erro ao criar boletim");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar boletim:", error);
    throw error;
  }
};