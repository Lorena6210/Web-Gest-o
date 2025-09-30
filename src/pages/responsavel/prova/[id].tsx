// pages/responsavel/[id]/provas.tsx

import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta, TurmaCompleta } from "@/lib/TurmaApi";
import { fetchGetProva, Prova } from "@/lib/provaApi";
import ResponsavelProvasPage from "@/components/responsavel/pova";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface ResponsavelProvasProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provas: Prova[];
}

export default function ResponsavelProvasContainer({
  usuario,
  turmas,
  provas,
}: ResponsavelProvasProps) {
  return (
    <ResponsavelProvasPage usuario={usuario} turmas={turmas} provas={provas} />
  );
}

export const getServerSideProps: GetServerSideProps<ResponsavelProvasProps> = async (
  context
) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) {
    return { notFound: true };
  }

  // Buscar usuário responsável
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.responsaveis?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) return { notFound: true };

  // Buscar turmas dos alunos do responsável
  const turmasResponse = await fetchTurmaCompleta(idNum);
  const turmas: TurmaCompleta[] = Array.isArray(turmasResponse) ? turmasResponse : [];

  // Buscar todas as provas (você pode filtrar depois por turma)
  const provasResponse = await fetchGetProva();
  const provas: Prova[] = provasResponse?.provas || [];

  return {
    props: {
      usuario,
      turmas,
      provas,
    },
  };
};
