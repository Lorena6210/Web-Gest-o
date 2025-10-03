
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
  capacidade: Aluno[] | undefined;
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