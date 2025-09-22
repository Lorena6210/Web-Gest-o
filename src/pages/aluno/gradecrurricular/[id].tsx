// pages/aluno/grade-curricular/[id].tsx
import { GetServerSideProps } from "next";
import AlunoGradeCurricular from "@/components/Alunos/gradeCurricular";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoAluno, fetchTurmaCompleta } from "@/lib/TurmaApi";
import {
  fetchGradesCurriculares,
  fetchDisciplinasPorGrade,
  GradeCurricular,
  GradeDisciplina,
  Disciplina
} from "@/lib/gradeCurricular";
import { fetchDisciplinas } from "@/lib/disciplinaApi";
import { TurmaCompleta } from "@/Types/Turma";

interface Usuario {
  Id: number;
  Nome: string;
  Email: string;
  Tipo: string;
  Turmas: TurmaCompleta[];
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  gradeCurricular: GradeCurricular[];
  disciplinas: Disciplina[];
  gradeDisciplinar: GradeDisciplina[];
}

export default function AlunoPage({
  usuario,
  turmas,
  gradeCurricular,
  disciplinas,
  gradeDisciplinar
}: Props) {
  const idTurma = turmas[0]?.Id || 0;

  return (
    <AlunoGradeCurricular
      usuario={usuario}
      grades={gradeCurricular}
      disciplinas={disciplinas}
      gradeDisciplinar={gradeDisciplinar}
      idTurma={idTurma}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) return { notFound: true };

  // Buscar usuário
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.alunos?.find((u: Usuario) => u.Id === idNum);
  if (!usuario) return { notFound: true };

  // Buscar turmas do aluno
  const turmas = await fetchTurmasDoAluno(idNum);
  const idTurma = turmas[0]?.Id || null;

  // Buscar todas as grades curriculares
  const gradeCurricular = await fetchGradesCurriculares();

  // Buscar disciplinas
  const disciplinas = await fetchDisciplinas();

  // Buscar disciplinas específicas da turma do aluno
  const idDisciplina = disciplinas[0]?.Id || null;
  const gradeDisciplinar = (idTurma && idDisciplina)
    ? await fetchDisciplinasPorGrade(idTurma, idDisciplina)
    : [];

  return {
    props: {
      usuario,
      turmas,
      gradeCurricular,
      disciplinas,
      gradeDisciplinar,
    },
  };
};
