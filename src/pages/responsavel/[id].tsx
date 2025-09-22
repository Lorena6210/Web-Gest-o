// pages/responsavel/[id].tsx

import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta, TurmaCompleta } from "@/lib/TurmaApi";
import ResponsavelPageComponent from "@/components/responsavel/ResponsavelPage";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface ResponsavelPageProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function ResponsavelPageContainer({ usuario, turmas }: ResponsavelPageProps) {
  return <ResponsavelPageComponent usuario={usuario} turmas={turmas} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  // Validar id
  if (isNaN(idNum)) {
    return { notFound: true };
  }

  // Buscar dados do usuário responsável
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.responsaveis?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) {
    return { notFound: true };
  }

  // Buscar turmas completas do responsável
  const turmas = await fetchTurmaCompleta(idNum);

  return {
    props: {
      usuario,
      turmas: Array.isArray(turmas) ? turmas : [],
    },
  };
};
