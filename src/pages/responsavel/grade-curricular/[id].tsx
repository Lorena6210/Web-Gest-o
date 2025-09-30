// pages/responsavel/[id]/grade-curricular.tsx

import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta, TurmaCompleta } from "@/lib/TurmaApi";
import { fetchGradesCurriculares, GradeCurricular } from "@/lib/gradeCurricular";
import { fetchDisciplinas } from "@/lib/disciplinaApi";
import { fetchProfessores } from "@/lib/ProfessorApi";
import { Disciplina } from "@/components/Gestores/TurmaCard"; // ou ajuste o caminho
import ResponsavelGradeCurricularPage from "@/components/responsavel/gradeCurricular";

interface Usuario {
  Id: number;
  Nome: string;
  Tipo: string;
}

interface Professor {
  Id: number;
  Nome: string;
  Email: string;
  Telefone?: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  gradeCurricular: (GradeCurricular & { Disciplinas: Disciplina[] })[];
  disciplinas: Disciplina[];
  professores: Professor[];
}

export default function ResponsavelGradeCurricularContainer({
  usuario,
  turmas,
  gradeCurricular,
  disciplinas,
  professores,
}: Props) {
  return (
    <ResponsavelGradeCurricularPage
      usuario={usuario}
      turmas={turmas}
      gradeCurricular={gradeCurricular}
      disciplinas={disciplinas}
      professores={professores}
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (isNaN(idNum)) return { notFound: true };

  // Buscar o usuário responsável
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.responsaveis?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) return { notFound: true };

  // Buscar turmas dos filhos
  const turmas = await fetchTurmaCompleta(idNum);
  const turmasArray = Array.isArray(turmas) ? turmas : [];

  // Buscar dados auxiliares
  const disciplinas = await fetchDisciplinas();
  const professores = await fetchProfessores();
  const rawGrades = await fetchGradesCurriculares();

  // Agrupar disciplinas por grade curricular
  const gradeMap = new Map<number, (GradeCurricular & { Disciplinas: Disciplina[] })>();

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

  const gradeCurricular = Array.from(gradeMap.values());

  return {
    props: {
      usuario,
      turmas: turmasArray,
      gradeCurricular,
      disciplinas,
      professores,
    },
  };
};
