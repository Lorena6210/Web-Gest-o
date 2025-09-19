import { GetServerSideProps } from "next";
import ProfessorGradeCurricular from "@/components/Professores/gradeCurricular";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from "@/lib/TurmaApi";
import { fetchGradeCurricular, GradeCurricular, Professor } from "@/lib/gradeCurricular";
import { fetchDisciplinas } from "@/lib/disciplinaApi";
import { TurmaCompleta } from "@/Types/Turma";
import { Disciplina } from '../../../components/Gestores/TurmaCard';
import { fetchProfessores } from "@/lib/ProfessorApi";

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
  professores: Professor[];
}

export default function ProfessorPageContainer({
  usuario,
  turmas,
  gradeCurricular,
  disciplinas,
  professores,
}: Props) {
  const idTurma = turmas[0]?.Id || 0;; // pegar a primeira turma
  const professorId = usuario.Id;

  return (
    <ProfessorGradeCurricular
      usuario={usuario} // passa como array se o componente espera array
      idTurma={idTurma}
      professorId={professorId}
      gradeCurricular={gradeCurricular}
      disciplinas={disciplinas}
      professores={professores}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: { Id: number }) => u.Id === idNum);

  if (!usuario) return { notFound: true };

  const turmas = await fetchTurmasDoProfessor(idNum);
  const idTurma = turmas[0]?.Id || 0;

  // Busca a grade curricular do professor e turma
  const gradeCurricular = await fetchGradeCurricular(idTurma, idNum);

  const disciplinas = await fetchDisciplinas();
  const professores = await fetchProfessores();

  return {
    props: {
      usuario,
      turmas,
      gradeCurricular,
      disciplinas,
      professores,
    },
  };
};
