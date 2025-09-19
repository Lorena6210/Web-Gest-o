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

  // Buscar o professor pelo ID
  const usuarios = await fetchUsuarios();
const usuario = usuarios.professores?.find((u: Usuario) => u.Id === idNum);

// Buscar as turmas do professor
const turmas = await fetchTurmasDoProfessor(idNum);

// Buscar as atividades do professor
const atividades = await fetchAtividades();

return {
  props: {
    usuario,
    turmas,
    atividades: atividades.map((atividade) => ({
      id: atividade.id ?? 0,
      titulo: atividade.titulo ?? "",
      turmaId: atividade.turmaId ?? null,
    })),
  },
};
};