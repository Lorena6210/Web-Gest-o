import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from '@/lib/TurmaApi';
import { TurmaCompleta } from '@/Types/Turma';
import { fetchProva, Prova } from '@/lib/provaApi'
import ProfessorProvaPageComponent from "@/components/Professores/prova";

interface Usuario {
    Nome: string;
    Id: number;
    Tipo: string;
}

interface Props {
    usuario: Usuario;
    turma: TurmaCompleta;  // agora é um único objeto
    prova: Prova[];
}
z
export default function ProfessorProvaPage({ usuario, turma, prova }: Props) {
  return <ProfessorProvaPageComponent usuario={usuario} turma={turma} prova={prova} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: { Id: number }) => u.Id === idNum);

  if (!usuario) return { notFound: true };

  const turmas = await fetchTurmasDoProfessor(idNum);
  const turma = turmas[0];

  return {
    props: { 
      usuario, 
      turma, 
      prova: await fetchProva(turma.Id),
    },
  };
};
