import { Turma, Aluno, TurmaCompleta } from "@/Types/turma";

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
