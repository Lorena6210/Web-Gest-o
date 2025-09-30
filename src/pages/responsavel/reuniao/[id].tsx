// pages/responsavel/[id]/reunioes.tsx

import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta, TurmaCompleta } from "@/lib/TurmaApi";
import { fetchReunioesPorResponsavel } from "@/lib/reuniaoApi";
import ResponsavelReunioesPage from "@/components/responsavel/reunião";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Reuniao {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  local: string;
  turma: string;
  participantes: string[];
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  reunioes: Reuniao[];
}

export default function ResponsavelReunioesContainer({ usuario, turmas, reunioes }: Props) {
  return (
    <ResponsavelReunioesPage
      usuario={usuario}
      turmas={turmas}
      reunioes={reunioes}
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) {
    return { notFound: true };
  }

  // Buscar usuário
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.responsaveis?.find((u: Usuario) => u.Id === idNum);
  if (!usuario) return { notFound: true };

  // Buscar turmas dos filhos
  const turmasResponse = await fetchTurmaCompleta(idNum);
  const turmas: TurmaCompleta[] = Array.isArray(turmasResponse) ? turmasResponse : [];

  // Buscar reuniões relacionadas ao responsável
  const reunioesResponse = await fetchReunioesPorResponsavel(idNum);
  const reunioes: Reuniao[] = Array.isArray(reunioesResponse) ? reunioesResponse : [];

  return {
    props: {
      usuario,
      turmas,
      reunioes,
    },
  };
};
