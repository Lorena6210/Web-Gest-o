import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";
import ProfessorPageComponent from "@/components/Professores/ProfessorPage";
import { NotaProva, fetchNotasProva } from "@/lib/provaApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  notasProvas: NotaProva[];
}

export default function ProfessorPageContainer({
  usuario,
  turmas,
  notasProvas,
}: Props) {
  return (
    <ProfessorPageComponent
      usuario={usuario}
      turmas={turmas}
      provasPorTurma={{}} // vazio, pois não usamos provas
      notasProvas={notasProvas}
    />
  );
}
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const { id, idProva } = context.query;
  const idNum = Number(id);
  const idProvaNum = Number(idProva);

  if (!id || isNaN(idNum) || !idProva || isNaN(idProvaNum)) {
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

  // Buscar notas da prova, tratando erro caso a API não retorne JSON
  let notasProvas: NotaProva[] = [];
  try {
    notasProvas = await fetchNotasProva(idProvaNum);
  } catch (error) {
    console.error("Erro ao buscar notas da prova:", error);
  }

  return {
    props: {
      usuario,
      turmas,
      notasProvas,
    },
  };
};
