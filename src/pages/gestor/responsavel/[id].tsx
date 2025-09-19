import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoGestor } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";
import TodosResponsaveisPage from "@/components/Gestores/responsavel/index";

interface Usuario {
  Nome: string;
  Id: number;
}

interface CriarProfessorProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function GestorPageContainer({ usuario, turmas}: CriarProfessorProps) {
  return <TodosResponsaveisPage usuario={usuario} turmas={turmas}  />;
}


export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.gestores?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) return { notFound: true };

  const turmas = await fetchTurmasDoGestor(idNum);

  return {
    props: { usuario, turmas },
  };
};
