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
  const { id, bimestre } = context.query;
  const idNum = Number(id);
  const bimestreNum = Number(bimestre) || null;

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
  const turmas = await fetchTurmaCompleta(idNum);
  const turmasIds = turmas.map((turma) => turma.idTurma);

  // Buscar todas as atividades (que retornam no formato { atividades: [...], filtroBimestre: 1 })
  const atividadesResponse = await fetchAtividades(idNum);

  // Extrair array de atividades
  const atividadesArray = Array.isArray(atividadesResponse?.atividades)
    ? atividadesResponse.atividades
    : [];

  // Filtrar atividades que pertencem às turmas do aluno e ao bimestre, se houver filtro
  const atividadesDoAluno = atividadesArray
    .filter((atividade) => {
      // Verifica se a atividade pertence a turma do aluno
      const turmaMatch = turmas.some((t) => t.Nome === atividade.turma);

      // Verifica o filtro de bimestre, se aplicado
      const bimestreMatch = bimestreNum
        ? atividade.idBimestre === bimestreNum
        : true;

      return turmaMatch && bimestreMatch;
    })
    .map((atividade) => ({
      id: atividade.id,
      titulo: atividade.titulo,
      descricao: atividade.descricao,
      dataCriacao: atividade.dataCriacao,
      dataEntrega: atividade.dataEntrega,
      professor: atividade.professor,
      turma: atividade.turma,
      disciplina: atividade.disciplina,
    }));

  return {
    props: {
      usuario,
      turmas,
      atividades: atividadesDoAluno,
    },
  };
};
