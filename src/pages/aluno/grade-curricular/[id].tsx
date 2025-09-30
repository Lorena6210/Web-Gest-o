import { GetServerSideProps } from "next";
import AlunoGradeCurricular from "@/components/Aluno/gradeCurricular";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta } from '@/lib/TurmaApi';
import { fetchGradesCurriculares, GradeCurricular } from "@/lib/gradeCurricular";
import { TurmaCompleta } from "@/Types/Turma";
import { fetchDisciplinas, Disciplina } from "@/lib/disciplinaApi";

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

  // Buscar turmas do aluno
  const turmas = await fetchTurmaCompleta(idNum);
  const turmasCompletas = turmas ? [turmas] : [];

  // Buscar dados auxiliares
  const disciplinas = await fetchDisciplinas();
  const rawGrades = await fetchGradesCurriculares();

  // Agrupar disciplinas por grade curricular
  const gradeMap = new Map<number, GradeCurricular & { Disciplinas: Disciplina[] }>();

  rawGrades.forEach((g) => {
    const disciplina: Disciplina = {
      Id_Disciplina: g.Id_Disciplina,
      Nome: g.Nome_Disciplina,
      Codigo: g.Codigo_Disciplina,
      Semestre: g.Semestre,
      CargaHoraria: g.CargaHoraria,
      Descricao: g.Descricao_Grade,
      Bimestre: g.Bimestre,
      Id_Professor: g.Id_Professor,
      Id_Turma: g.Id_Turma,
    };

    const gradeId = g.Id_GradeCurricular;

    if (gradeMap.has(gradeId)) {
      gradeMap.get(gradeId)!.Disciplinas.push(disciplina);
    } else {
      gradeMap.set(gradeId, {
        ...g,
        Disciplinas: [disciplina],
      });
    }
  });

  const gradeCurricular = Array.from(gradeMap.values()).map((g) => ({
    ...g,
    Disciplinas: g.Disciplinas || [],
  }));

  return {
    props: {
      usuario,
      turmas: turmasCompletas,
      gradeCurricular,
    },
  };
};
