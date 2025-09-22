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
  turmaId: number;
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

  const atividadesResponse = await fetchAtividades();
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
        turmaId: atividade.turmaId ?? null, // evita undefined
      })),
    },
  };
};
