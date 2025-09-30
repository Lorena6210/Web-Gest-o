// pages/responsavel/[id]/atividades.tsx

import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta, TurmaCompleta } from "@/lib/TurmaApi";
import { fetchAtividadesResponsavel, AtividadeDetalhada } from "@/lib/atividadeApi";
import ResponsavelAtividadesPage from "@/components/responsavel/atividade";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface ResponsavelAtividadesProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  atividades: AtividadeDetalhada[];
}

export default function ResponsavelAtividadesContainer({
  usuario,
  turmas,
  atividades,
}: ResponsavelAtividadesProps) {
  return (
    <ResponsavelAtividadesPage usuario={usuario} turmas={turmas} atividades={atividades} />
  );
}

export const getServerSideProps: GetServerSideProps<ResponsavelAtividadesProps> = async (
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

  if (!usuario) {
    return { notFound: true };
  }

  // Buscar turmas do responsável
  const turmasResponse = await fetchTurmaCompleta(idNum);
  const turmas: TurmaCompleta[] = Array.isArray(turmasResponse) ? turmasResponse : [];

  // Buscar atividades do responsável (assumindo que essa função existe)
  const atividadesResponse = await fetchAtividadesResponsavel(idNum);
  const atividades: AtividadeDetalhada[] = Array.isArray(atividadesResponse)
    ? atividadesResponse
    : [];

  return {
    props: {
      usuario,
      turmas,
      atividades,
    },
  };
};
