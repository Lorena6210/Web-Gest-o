// pages/aluno/[id].tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoAluno } from '@/lib/TurmaApi';
import { TurmaCompleta } from '@/Types/Turma';
import AlunoPageComponent from "@/components/Alunos/AlunoPage";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function AlunoPageContainer({ usuario, turmas }: Props) {
  return <AlunoPageComponent usuario={usuario} turmas={turmas} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) {
    return { notFound: true };
  }

  // Buscar o aluno pelo ID
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.alunos?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) {
    return { notFound: true };
  }

  // Buscar turmas do aluno
  const turmas = await fetchTurmasDoAluno(idNum);

  return {
    props: {
      usuario,
      turmas,
    },
  };
};
