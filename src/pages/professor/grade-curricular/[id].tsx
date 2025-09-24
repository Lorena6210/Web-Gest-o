// pages/professor/grade-curricular/[id].tsx
import { GetServerSideProps } from "next";
import ProfessorGradeCurricular from "@/components/Professores/gradeCurricular";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchGradesCurriculares, GradeCurricular } from "@/lib/gradeCurricular";
import { fetchTurmaCompleta } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";

interface Usuario {
  Id: number;
  Nome: string;
  Email: string;
  Senha: string;
  Tipo: string;
}

interface Disciplina {
  Id_Disciplina: number;
  Nome: string;
  Codigo: string;
  Semestre: number;
  CargaHoraria: number;
  Descricao?: string;
  Bimestre: number;
  Id_Professor: number;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  gradeCurricular: (GradeCurricular & { Disciplinas: Disciplina[] })[];
}

export default function ProfessorPage({ usuario, gradeCurricular, turmas }: Props) {
  return <ProfessorGradeCurricular
    usuario={usuario}
    turmas={turmas} 
    grades={gradeCurricular}
    tipoAgrupamento="semestre" // ou "bimestre"
  />
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: Usuario) => u.Id === idNum);
  if (!usuario) return { notFound: true };

  const rawGrades = await fetchGradesCurriculares();

  // Agrupar disciplinas por grade e filtrar pelo professor
  const gradeMap = new Map<number, (GradeCurricular & { Disciplinas: Disciplina[] })>();

  rawGrades.forEach(g => {
    // Verifica se a disciplina pertence ao professor logado
    if (g.Id_Professor !== idNum) return;

    const disciplina: Disciplina = {
      Id_Disciplina: g.Id_Disciplina,
      Nome: g.Nome_Disciplina,
      Codigo: g.Codigo_Disciplina,
      Semestre: g.Semestre,
      CargaHoraria: g.CargaHoraria,
      Descricao: g.Descricao_Grade,
      Bimestre: g.Bimestre,
      Id_Professor: g.Id_Professor,
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

  const gradeCurricular = Array.from(gradeMap.values()).map(g => ({
    ...g,
    Disciplinas: g.Disciplinas || [],
  }));

  const turma = await fetchTurmaCompleta(idNum);
  const turmas = turma ? [turma] : [];

  return {
    props: {
      usuario,
      gradeCurricular,
      turmas
    },
  };
};
