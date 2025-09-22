// pages/responsavel/[id].tsx

import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta, TurmaCompleta } from "@/lib/TurmaApi";
import { fetchEventosPorResponsavel, Evento } from "@/lib/EventosApi"; // suposição
import ResponsavelPageComponent from "@/components/responsavel/ResponsavelPage";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface ResponsavelPageProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  eventos: Evento[];
}

export default function ResponsavelPageContainer({
  usuario,
  turmas,
  eventos,
}: ResponsavelPageProps) {
  return (
    <ResponsavelPageComponent
      usuario={usuario}
      turmas={turmas}
      eventos={eventos}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  // Buscar dados do usuário responsável
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.responsaveis?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) {
    return { notFound: true };
  }

  // Buscar turmas do responsável
  const turmas = await fetchTurmaCompleta(idNum);

  // Buscar eventos do responsável
  let eventos: Evento[] = [];
  try {
    eventos = await fetchEventosPorResponsavel(idNum);
  } catch (err) {
    console.error("Erro ao buscar eventos do responsável:", err);
    eventos = [];
  }

  return {
    props: {
      usuario,
      turmas: Array.isArray(turmas) ? turmas : [],
      eventos,
    },
  };
};
