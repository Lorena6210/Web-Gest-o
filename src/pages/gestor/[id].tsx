// pages/gestor/[id]/index.tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoGestor } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";
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

  // Buscar dados do usuário gestor
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.gestores?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) {
    return { notFound: true };
  }

  // Buscar todas as turmas que o gestor administra
  const turmas = await fetchTurmasDoGestor(idNum);

  return {
    props: {
      usuario,
      turmas,
    },
  };
};

