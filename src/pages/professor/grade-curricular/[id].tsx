// pages/professor/grade-curricular/[id].tsx
import { GetServerSideProps } from "next";
import ProfessorGradeCurricular from "@/components/Professores/gradeCurricular";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor, fetchTurmaCompleta } from "@/lib/TurmaApi";
import {
  fetchGradesCurriculares,
  fetchDisciplinasPorGrade,
  GradeCurricular,
  GradeDisciplina,
  Disciplina,
  fetchProfessoresPorGradeEDisciplina
} from "@/lib/gradeCurricular";

import { fetchDisciplinas } from "@/lib/disciplinaApi";
import { fetchProfessores } from "@/lib/ProfessorApi";
import { TurmaCompleta } from "@/Types/Turma";

interface Usuario {
  Id: number;
  Nome: string;
  Email: string;
  Senha: string;
  Tipo: string;
  Turmas: TurmaCompleta[];
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  gradeCurricular: GradeCurricular[];
  disciplinas: Disciplina[];
  professores: Usuario[];
  gradeDisciplinar: GradeDisciplina[];
  professoresPorGradeEDisciplina: Usuario[];
}

export default function ProfessorPage({
  usuario,
  turmas,
  gradeCurricular,
  disciplinas,
  professores,
  gradeDisciplinar,
  professoresPorGradeEDisciplina
}: Props) {
  const idTurma = turmas[0]?.Id || 0;

  return (
    <ProfessorGradeCurricular
      usuario={usuario}
      grades={gradeCurricular}
      disciplinas={disciplinas}
      professores={professores}
      gradeDisciplinar={gradeDisciplinar}
      idTurma={idTurma}
      professoresPorGradeEDisciplina={professoresPorGradeEDisciplina}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  // Buscar usuário
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: Usuario) => u.Id === idNum);
  if (!usuario) return { notFound: true };

  // Buscar turmas do professor
  const turmas = await fetchTurmasDoProfessor(idNum);

  //  Declarar idTurma antes de usar
  const idTurma = turmas[0]?.Id || null;

  // Buscar todas as grades curriculares
  const gradeCurricular = await fetchGradesCurriculares();

  // Buscar disciplinas
  const disciplinas = await fetchDisciplinas();

  // Buscar professores
  const professores = await fetchProfessores();

  // Buscar disciplinas específicas da turma
  const idDisciplina = disciplinas[0]?.Id || null;
  const gradeDisciplinar = (idTurma && idDisciplina) ? await fetchDisciplinasPorGrade(idTurma, idDisciplina) : [];

  // Buscar professores por grade e disciplina
const professoresPorGradeEDisciplina = (idTurma && gradeDisciplinar[0]?.Id)
  ? await fetchProfessoresPorGradeEDisciplina(idTurma, gradeDisciplinar[0].Id)
  : [];

  const turmaCompleta = idTurma ? await fetchTurmaCompleta(idTurma) : null;

  return {
    props: {
      usuario,
      turmas,
      gradeCurricular,
      disciplinas,
      professores,
      gradeDisciplinar,
      professoresPorGradeEDisciplina,
      turmaCompleta,
    },
  };
};
