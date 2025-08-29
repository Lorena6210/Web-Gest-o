// pages/professor/[id].tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from '@/lib/TurmaApi';
import { TurmaCompleta } from '@/Types/Turma';
import ProfessorPageComponent from "@/components/Professores/ProfessorPage";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function ProfessorPageContainer({ usuario, turmas }: Props) {
  return <ProfessorPageComponent usuario={usuario} turmas={turmas} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) {
    return { notFound: true };
  }

  // Buscar o professor pelo ID
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) {
    return { notFound: true };
  }

  const turmas = await fetchTurmasDoProfessor(idNum);
  return {
    props: {
      usuario,
      turmas,
    },
  };
};
