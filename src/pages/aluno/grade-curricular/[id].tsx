import { GetServerSideProps } from "next";
import AlunoGradeCurricular from "@/components/Aluno/gradeCurricular";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta } from '@/lib/TurmaApi';
import { fetchGradesCurriculares, GradeCurricular } from "@/lib/gradeCurricular";
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
}

export default function AlunoPage({ usuario, turmas, gradeCurricular }: Props) {
  const idTurma = turmas.length > 0 ? turmas[0].Id : 0;

  return (
    <AlunoGradeCurricular
      usuario={usuario}
      turmas={turmas}
      grades={gradeCurricular}
      idTurma={idTurma}
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) return { notFound: true };

  // Buscar aluno
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.alunos?.find((u: Usuario) => u.Id === idNum);
  if (!usuario) return { notFound: true };

  // Buscar turma do aluno
  let turmas = await fetchTurmaCompleta(idNum);
  turmas = Array.isArray(turmas) ? turmas : turmas ? [turmas] : [];
  if (turmas.length === 0) return { notFound: true };

  const turma = turmas[0];
  const idGrade = turma.Id_GradeCurricular;

  // Buscar apenas as disciplinas da grade
  const disciplinas = idGrade ? await fetchDisciplinasPorGrade(idGrade) : [];

  // Retornar disciplinas como "gradeCurricular"
   const gradeCurricular = await fetchGradesCurriculares();

  return {
    props: {
      usuario,
      turmas,
      gradeCurricular,
    },
  };
};
