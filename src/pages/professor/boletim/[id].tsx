import { GetServerSideProps } from "next";
import ProfessorBoletim from "@/components/Professores/boletim";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from '@/lib/TurmaApi';
import { fetchGetBoletim, Boletim } from '@/lib/BoletimApi'
import { fetchDisciplinas } from "@/lib/disciplinaApi";
import { fetchAlunos } from "@/lib/AlunoApi";
import { TurmaCompleta } from '@/Types/Turma';
import { Disciplina, Aluno } from '../../../components/Gestores/TurmaCard';

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}
interface Props {
  usuario: Usuario;
  boletim: Boletim[];
  Disciplina: Disciplina[];
  turmas: TurmaCompleta[];
  Aluno: Aluno;
}

export default function ProfessorBoletimPage({ usuario, boletim, turmas, Disciplina,  Aluno }: Props) {
  return (
    <>
      <ProfessorBoletim usuario={usuario} boletim={boletim} turmas={turmas} Disciplina={Disciplina} Aluno={Aluno} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: { Id: number; }) => u.Id === idNum);

  if (!usuario) return { notFound: true };

  const turmas = await fetchTurmasDoProfessor(idNum);
//   const boletim = await fetchBoletim(idNum);
// 
return {
  props: { 
    usuario, 
    turma: turmas[0], 
    boletim: await fetchGetBoletim(),
    Disciplina: await fetchDisciplinas(),
    Aluno: await fetchAlunos()
  },
};
};