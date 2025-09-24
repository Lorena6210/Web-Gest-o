import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";
import ProfessorPageComponent from "@/components/Professores/ProfessorPage";
import { Prova, fetchProvasCompleto, NotaProva, fetchNotasProva } from "@/lib/provaApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provasPorTurma: Record<number, Prova[]>;
  notasProvas: NotaProva[];
}

export default function ProfessorPageContainer({
  usuario,
  turmas,
  provasPorTurma,
  notasProvas,
}: Props) {
  return (
    <ProfessorPageComponent
      usuario={usuario}
      turmas={turmas}
      provasPorTurma={provasPorTurma}
      notasProvas={notasProvas}
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) {
    return { notFound: true };
  }

  // Buscar o professor pelo ID
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((prof) => prof.Id === idNum);

  if (!usuario) {
    return { notFound: true };
  }

  // Buscar as turmas do professor
  const turmas = await fetchTurmasDoProfessor(idNum);

  // Buscar as provas de cada turma
  const provasPorTurma: Record<number, Prova[]> = {};
  for (const turma of turmas) {
    const provas = await fetchProvasCompleto(turma.Id);
    provasPorTurma[turma.Id] = provas;
  }

  // Buscar todas as notas das provas
  const notasProvas: NotaProva[] = await fetchNotasProva(idNum);

  return {
    props: {
      usuario,
      turmas,
      provasPorTurma,
      notasProvas,
    },
  };
};
