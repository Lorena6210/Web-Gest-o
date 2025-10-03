// pages/gestor/grade-curricular/[id].tsx
import { GetServerSideProps } from "next";
import GestorGradeCurricular from "@/components/Gestores/gradeCurricular";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoGestor, fetchTurmaCompleta } from "@/lib/TurmaApi";
import { fetchGradesCurriculares, GradeCurricular } from "@/lib/gradeCurricular";
import { fetchDisciplinas } from "@/lib/disciplinaApi";
import { fetchProfessores } from "@/lib/ProfessorApi";
import { TurmaCompleta } from "@/Types/Turma";
import { Disciplina } from "@/components/Gestores/TurmaCard";

interface Usuario {
  Id: number;
  Nome: string;
  Email: string;
  Senha: string;
  Tipo: string;
  Turmas?: TurmaCompleta[];
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

export default function PageGradecurricular({
  usuario,
  turmas,
  gradeCurricular,
  disciplinas,
  professores,
}: Props) {
  return (
    <GestorGradeCurricular
      usuario={usuario}
      turmas={turmas}
      gradeCurricular={gradeCurricular}
      disciplinas={disciplinas}
      professores={professores}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (isNaN(idNum)) return { notFound: true };

  // Buscar o usuário gestor
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.gestores?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) return { notFound: true };

  // Buscar as turmas do gestor
  const turmas = await fetchTurmasDoGestor(idNum);

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

  const gradeCurricular = Array.from(gradeMap.values()).map((g) => ({
    ...g,
    Disciplinas: g.Disciplinas || [],
  }));

  // Garantir turmas detalhadas
  const turma = await fetchTurmaCompleta(idNum);
  const turmasCompletas = turma ? [turma] : turmas;

  return {
    props: {
      usuario,
      turmas: turmasCompletas,
      gradeCurricular,
      disciplinas,
      professores,
    },
  };
};
