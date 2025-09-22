import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoAluno } from '@/lib/TurmaApi'; // nova função específica para aluno
import { fetchAtividades } from '@/lib/atividadeApi'
import { TurmaCompleta } from '@/Types/Turma';
import AlunoAtividadePageComponent from "@/components/Alunos/atividade"; // componente de visualização para aluno

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

export default function AlunoPageContainer({ usuario, turmas, atividades }: Props) {
  return <AlunoAtividadePageComponent usuario={usuario} turmas={turmas} atividades={atividades} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) {
    return { notFound: true };
  }

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.alunos?.find((u: Usuario) => u.Id === idNum); // buscar aluno

  if (!usuario) {
    return { notFound: true };
  }

  // Buscar turmas do aluno
  const turmas = await fetchTurmasDoAluno(idNum);

  // Buscar atividades
  const atividadesResponse = await fetchAtividades();
  const atividadesArray: Atividade[] = Array.isArray(atividadesResponse)
    ? atividadesResponse
    : atividadesResponse?.atividades || [];

  // Filtrar atividades apenas das turmas do aluno
const turmasIds = turmas.map(({ id }: { id: number }) => id);
const atividadesDoAluno = atividadesArray
    .filter(a => turmasIds.includes(a.turmaId))
    .map((atividade) => ({
      id: atividade.id,
      titulo: atividade.titulo,
      turmaId: atividade.turmaId ?? null,
    }));

  return {
    props: {
      usuario,
      turmas,
      atividades: atividadesDoAluno,
    },
  };
};
