import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from '@/lib/TurmaApi';
import { fetchAtividades } from '@/lib/atividadeApi'
import { TurmaCompleta } from '@/Types/Turma';
import ProfessorAtividadePageComponentI from "@/components/Professores/atividade";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Atividade {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataEntrega: string;
  professor: string;
  turma: string;
  disciplina: string;
  turmaId?: number | null; // opcional, caso queira usar
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  atividades: Atividade[];
}

export default function ProfessorPageContainer({ usuario, turmas, atividades }: Props) {
  return <ProfessorAtividadePageComponentI usuario={usuario} turmas={turmas} atividades={atividades} />;
}
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) {
    return { notFound: true };
  }

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: Usuario) => u.Id === idNum);

  const turmas = await fetchTurmasDoProfessor(idNum);

  const atividadesResponse = await fetchAtividades(idNum);
  const atividadesArray: Atividade[] = Array.isArray(atividadesResponse)
    ? atividadesResponse
    : atividadesResponse?.atividades || [];

  return {
    props: {
      usuario,
      turmas,
      atividades: atividadesArray.map((atividade) => ({
        id: atividade.id,
        titulo: atividade.titulo,
        descricao: atividade.descricao ?? '',
        dataCriacao: atividade.dataCriacao ?? '',
        dataEntrega: atividade.dataEntrega ?? '',
        professor: atividade.professor ?? '',
        turma: atividade.turma ?? '',
        disciplina: atividade.disciplina ?? '',
        turmaId: atividade.turmaId ?? null,
      })),
    },
  };
};
