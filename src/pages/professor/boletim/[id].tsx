import { GetServerSideProps } from "next";
import ProfessorBoletim from "@/components/Professores/boletim";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from '@/lib/TurmaApi';
import { fetchGetBoletins, Boletim } from '@/lib/BoletimApi';
import { fetchDisciplinas } from "@/lib/disciplinaApi";
import { fetchAlunos } from "@/lib/AlunoApi";
import { fetchFaltas } from "@/lib/FaltaApi";

import { TurmaCompleta } from '@/Types/Turma';
import { Disciplina, Aluno } from '../../../components/Gestores/TurmaCard';

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Falta {
  Id: number;
  Id_Aluno: number;
  Id_Turma: number;
  Id_Disciplina: number;
  DataFalta: string;
  Justificada: number;
}

interface Props {
  usuario: Usuario;
  boletim: Boletim[];
  Disciplina: Disciplina[];
  turmas: TurmaCompleta[];
  Aluno: Aluno;
  faltas: Falta[]; 
}

export default function ProfessorBoletimPage({
  usuario,
  boletim,
  turmas,
  Disciplina,
  Aluno,
  faltas, 
}: Props) {
  return (
    <>
      <ProfessorBoletim
        usuario={usuario}
        boletim={boletim}
        turmas={turmas}
        Disciplina={Disciplina}
        Aluno={Aluno}
        faltas={faltas} 
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: { Id: number }) => u.Id === idNum);

  if (!usuario) return { notFound: true };

  const turmas = await fetchTurmasDoProfessor(idNum);
  const boletim = await fetchGetBoletins();
  const Disciplina = await fetchDisciplinas();
  const Aluno = await fetchAlunos();
  const faltasFiltradas = await fetchFaltas();

  return {
    props: {
      usuario,
      turmas,
      boletim,         
      Disciplina,
      Aluno,
      faltas: faltasFiltradas, 
    },
  };
};
