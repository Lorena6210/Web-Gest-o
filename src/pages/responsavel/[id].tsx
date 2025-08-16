// pages/responsavel/[id].tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta, TurmaCompleta } from "@/lib/TurmaApi";
import ResponsavelPageComponent from "@/components/ResponsavelPage";

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

  // Buscar turmas do responsável
  const turmas = await fetchTurmaCompleta(idNum);

  // Buscar dados do usuário responsável
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.responsaveis?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) {
    return { notFound: true };
  }

  return {
    props: {
      usuario,
      turmas: Array.isArray(turmas) ? turmas : [],
    },
  };
};
