import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoGestor } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";
import TodasAlunosPage from '@/components/Gestores/alunos/criar';

interface Usuario {
  Nome: string;
  Id: number;
}

interface CriarAlunoProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function GestorPageContainer({ usuario, turmas}: CriarAlunoProps) {
  return <TodasAlunosPage usuario={usuario} turmas={turmas}  />;
}


export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.gestores?.find(u => u.Id === idNum);

  if (!usuario) return { notFound: true };

  const turmas = await fetchTurmasDoGestor(idNum);

  return {
    props: { usuario, turmas },
  };
};
