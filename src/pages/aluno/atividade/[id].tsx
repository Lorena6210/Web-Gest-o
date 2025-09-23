// pages/aluno.tsx (ou pages/professor.tsx dependendo do seu caso)

import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta } from "@/lib/TurmaApi";
import { fetchAtividades } from "@/lib/atividadeApi";
import ProfessorAtividadePageComponentI from "@/components/Aluno/atividade"; // ou Professor, dependendo do nome correto
import { TurmaCompleta } from "@/Types/Turma";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface AtividadeDetalhada {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataEntrega: string;
  dataFinalizacao: string;
  professor: string;
  turma: string;
  disciplina: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  atividades: AtividadeDetalhada[];
}

export default function AlunoPageContainer({
  usuario,
  turmas,
  atividades,
}: Props) {
  return (
    <ProfessorAtividadePageComponentI
      usuario={usuario}
      turmas={turmas}
      atividades={atividades}
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
  const usuario = usuarios.alunos?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) {
    return { notFound: true };
  }

  // Buscar turmas do aluno
  const turmasResponse = await fetchTurmaCompleta(idNum);

  // Garantir que seja sempre array
  const turmas: TurmaCompleta[] = Array.isArray(turmasResponse)
    ? turmasResponse
    : turmasResponse?.turmas || [];

  const turmasIds = turmas.map((turma) => turma.idTurma);

  // Buscar atividades
  const atividadesResponse = await fetchAtividades(idNum);
  const atividades = atividadesResponse?.atividades || [];

  return {
    props: {
      usuario,
      turmas,
      atividades,
    },
  };
};
