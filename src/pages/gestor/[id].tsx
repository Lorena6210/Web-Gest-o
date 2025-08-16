// pages/gestor/[id].tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta, TurmaCompleta } from "@/lib/TurmaApi";
import GestorPageComponent from "@/components/Gestores/GestorPage";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface GestorPageProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function GestorPageContainer({ usuario, turmas }: GestorPageProps) {
  return <GestorPageComponent usuario={usuario} turmas={turmas} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  // Buscar turmas do gestor
  const turmas = await fetchTurmaCompleta(idNum);

  // Buscar dados do usuário gestor
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.gestores?.find((u: Usuario) => u.Id === idNum);

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
