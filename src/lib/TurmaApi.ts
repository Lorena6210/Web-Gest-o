
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
}

export interface Turma {
  alunos: Aluno[];
  professores: Professor[];

  disciplinas: Disciplina[];
}

export interface Professor {
  Id: number;
  Nome: string;
  Email: string;
  FotoPerfil?: string | null;
  Disciplinas: string;
  TotalDisciplinas: number;
}
export async function fetchTurmaCompleta(id: number): Promise<TurmaCompleta[]> {
  const response = await fetch(`http://localhost:3000/turmas/${id}/completa`);
  if (!response.ok) {
    throw new Error("Erro ao obter turma completa");
  }
  const json = await response.json();
  return json.data ?? [];
}

export const fetchTurmasLista = async (
  idAluno?: number,
  idProfessor?: number,
  idDisciplina?: number
) => {
  try {
    const response = await fetch('http://localhost:3000/turmas');
    if (!response.ok) {
      throw new Error("Erro ao buscar turmas");
    }

    const data = await response.json();
    const turmas = data.data || [];

    // Filtra turmas por aluno, professor e disciplina, se passado
    const turmasFiltradas = turmas.filter((turma: Turma) => {
      const temAluno = idAluno
        ? turma.alunos?.some((aluno: Aluno) => aluno.Id === idAluno)
        : true;
      const temProfessor = idProfessor
        ? turma.professores?.some((prof) => prof.Id === idProfessor)
        : true;
      const temDisciplina = idDisciplina
        ? turma.disciplinas?.some((disc) => disc.Id === idDisciplina)
        : true;

      return temAluno && temProfessor && temDisciplina;
    });

    return turmasFiltradas;
  } catch (error) {
    console.error("Erro ao carregar turmas:", error);
    return [];
  }
};
