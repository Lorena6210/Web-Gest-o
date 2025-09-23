import { GetServerSideProps } from "next";
import AlunoGradeCurricular from "@/components/Aluno/gradeCurricular";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta } from '@/lib/TurmaApi';
import { fetchDisciplinasPorGrade, GradeCurricular } from "@/lib/gradeCurricular";
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
      grades={gradeCurricular}
      idTurma={idTurma}
    />
  );
}
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) return { notFound: true };

  // Buscar usuário
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.alunos?.find((u: Usuario) => u.Id === idNum);
  if (!usuario) return { notFound: true };

  // Buscar turmas do aluno
  let turmas = await fetchTurmaCompleta(idNum);
  turmas = Array.isArray(turmas) ? turmas : turmas ? [turmas] : [];

  if (turmas.length === 0) return { notFound: true };

  // Pegar a primeira turma do aluno
  const turma = turmas[0];

  // Supondo que cada turma tenha um Id_GradeCurricular
  const idGrade = turma.Id_GradeCurricular;
  let disciplinas: Disciplina[] = [];

  if (idGrade) {
    disciplinas = await fetchDisciplinasPorGrade(idGrade);
  }

  // Montar a grade curricular completa
  const gradeCurricular: GradeCurricular[] = [
    {
      Id_GradeCurricular: idGrade,
      Descricao_Grade: turma.Descricao_Grade,
      Disciplinas: disciplinas,
      // Adicione outros campos que precisar
    },
  ];

  return {
    props: {
      usuario,
      turmas,
      gradeCurricular,
    },
  };
};
