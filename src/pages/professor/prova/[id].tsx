// pages/professor/[id].tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";
import ProfessorPageComponent from "@/components/Professores/ProfessorPage";
import { Prova, fetchProvas } from "@/lib/provaApi";
import { NotaProva, fetchNotasProva } from "@/lib/provaApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  // novo:
  provasPorTurma: Record<number, Prova[]>; // chave = idTurma
  notasProvas: NotaProva[];
}

export default function ProfessorPageContainer({
  usuario,
  turmas,
  provasPorTurma,
  notasProvas,
}: Props) {
  // Se você quiser, pode selecionar uma turma padrão, ou passar tudo para componente
  return (
    <ProfessorPageComponent
      usuario={usuario}
      turmas={turmas}
      provasPorTurma={provasPorTurma}
      notasProvas={notasProvas}
    />
  );
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

  if (!usuario) {
    return { notFound: true };
  }

  const turmas = await fetchTurmasDoProfessor(idNum);

  // Agora carregar as provas de cada turma
  const provasPorTurma: Record<number, Prova[]> = {};

  for (const turma of turmas) {
    try {
      const provas = await fetchProvas(turma.Id);
      provasPorTurma[turma.Id] = provas;
    } catch (error) {
      console.error(`Erro ao buscar provas da turma ${turma.Id}`, error);
      provasPorTurma[turma.Id] = [];
    }
  }

  // Carregar todas as notas de provas (opcional: filtrar por turmas/provas específicas)
  let notasProvas: NotaProva[] = [];
  for (const turma of turmas) {
    const provas = provasPorTurma[turma.Id] || [];
    for (const prova of provas) {
      try {
        const notas = await fetchNotasProva(prova.id);
        notasProvas = notasProvas.concat(notas);
      } catch (error) {
        console.error(`Erro ao buscar notas da prova ${prova.id}`, error);
      }
    }
  }

  return {
    props: {
      usuario,
      turmas,
      provasPorTurma,
      notasProvas,
    },
  };
};
