
 export interface Aluno {
  Id: number;
  Nome: string;
  RA: string;
  FotoPerfil?: string | null;
}

export interface Disciplina {
  Id: number;
  Nome: string;
  Codigo: string;
  CargaHoraria: number;
}

export interface TurmaCompleta {
  Id: number;
  Nome: string;
  Serie: string | null;
  AnoLetivo: number;
  Turno: string | null;
  Sala?: string;
  CapacidadeMaxima?: number;
  alunos?: Aluno[];
  professores?:Professor[];
  disciplinas?: Disciplina[];
  atividades?: Atividades[];
  provas?: Provas[];
  faltas?: Faltas[];
  gestores?: Gestor[];
}
export interface Atividades {
  Id: number;
  Nome: string;
  Data: string;
  Disciplina: number;
}

export interface Provas {
  Id: number;
  Nome: string;
  Data: string;
  Disciplina: number;
}
export interface Faltas {
  Id: number;
  Nome: string;
  Data: string;
  Disciplina: number;
}

export interface Turma {
  alunos: Aluno[];
  professores: Professor[];
  disciplinas: Disciplina[];
}

export interface Gestor {
  Id: number;
  Nome: string;
  Email: string;
  FotoPerfil?: string | null;
}

export interface Professor {
  Id: number;
  Nome: string;
  Email: string;
  FotoPerfil?: string | null;
  Disciplinas: string;
  TotalDisciplinas: number;
}
export async function fetchTurmaCompleta(id: number): Promise<TurmaCompleta> {
  const response = await fetch(`http://localhost:3000/turmas/${id}/completa`);
  if (!response.ok) {
    throw new Error("Erro ao obter turma completa");
  }
  const json = await response.json();
  return json.data as TurmaCompleta;
}

export const fetchTurmaDoAluno = async (
  idAluno: number,
  idDisciplina?: number
): Promise<TurmaCompleta | null> => {
  try {
    const response = await fetch("http://localhost:3000/turmas");
    if (!response.ok) throw new Error("Erro ao buscar turmas");

    const data = await response.json();
    const turmas = data.turmas || [];

    // Encontrar a turma do aluno (e opcionalmente da disciplina)
    const turmaAluno = turmas.find((turma: TurmaCompleta) => {
      const temAluno = turma.alunos?.some((aluno) => aluno.Id === idAluno);
      const temDisciplina = idDisciplina
        ? turma.disciplinas?.some((disc) => disc.Id === idDisciplina)
        : true;
      return temAluno && temDisciplina;
    });

    if (!turmaAluno) return null;

    // Buscar versão completa (com professores e gestores, se existir)
    const turmaResponse = await fetch(
      `http://localhost:3000/turmas/${turmaAluno.Id}/completa`
    );
    if (!turmaResponse.ok) throw new Error("Erro ao buscar turma completa");

    const turmaJson = await turmaResponse.json();

    return {
      ...turmaJson.data,
      professores: turmaJson.data.professores || turmaAluno.professores || [],
      gestores: turmaJson.data.gestores || [] //  garante que gestores sejam incluídos
    } as TurmaCompleta;
  } catch (error) {
    console.error(error);
    return null;
  }
};


// lib/TurmaApi.ts
export const fetchTurmasDoProfessor = async (idProfessor: number): Promise<TurmaCompleta[]> => {
  try {
    const response = await fetch("http://localhost:3000/turmas");
    if (!response.ok) throw new Error("Erro ao buscar turmas");

    const data = await response.json();
    const turmas = data.turmas || [];

    // Filtra turmas que o professor leciona
    return turmas.filter((turma: TurmaCompleta) =>
      turma.professores?.some((prof) => prof.Id === idProfessor)
    );
  } catch (error) {
    console.error(error);
    return [];
  }
};

// lib/TurmaApi.ts
export const fetchTurmasDoGestor = async (idGestor: number): Promise<TurmaCompleta[]> => {
  try {
    const response = await fetch("http://localhost:3000/turmas");
    if (!response.ok) throw new Error("Erro ao buscar turmas");

    const data = await response.json();
    const turmas = data.turmas || [];

    // Filtra turmas que o gestor administra
    return turmas.filter((turma: TurmaCompleta) =>
      turma.gestores?.some((gestor) => gestor.Id === idGestor)
    );
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchTurmas = async (): Promise<TurmaCompleta[]> => {
  try {
    const response = await fetch("http://localhost:3000/turmas");
    if (!response.ok) throw new Error("Erro ao buscar turmas");

    const data = await response.json();
    return data.turmas || [];
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    return [];
  }
}

export const fetchCreateTurmas = async (turma: TurmaCompleta): Promise<TurmaCompleta> => {
  try {
    const response = await fetch("http://localhost:3000/turmas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(turma),
    });
    if (!response.ok) throw new Error("Erro ao criar turma");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    throw error;
  }
}

export const fetchDeleteTurma = async (turma: TurmaCompleta): Promise<TurmaCompleta> => {
  try {
    const response = await fetch(`http://localhost:3000/turmas/${turma.Id}/excluir`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao excluir turma: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    throw error;
  }
};

