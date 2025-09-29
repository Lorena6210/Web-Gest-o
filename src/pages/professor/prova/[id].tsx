// pages/professor/[id]/provas.tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";
import ListaDeProvas from "@/components/Professores/prova/index";
import { NotaProva, fetchGetProva } from "@/lib/provaApi";
import { fetchNotas } from '@/lib/NotasApi';


interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

export interface Prova {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataEntrega: string;
  idBimestre: number;
  nomeBimestre: string;
  professor: string;
  turma: string;
  disciplina: string;
}

interface ProvaResponse {
  provas: Prova[];
  filtros: {
    turmaId: string;
    bimestre: string;
  };
}
interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provas: Prova[];
  notas: Nota[];       // <-- novo
  notasProvas: NotaProva[];
}

export default function ProfessorPageContainer({
  usuario,
  turmas,
  provas,
  notas,
  notasProvas,
}: Props) {
  return (
    <ListaDeProvas
      usuario={usuario}
      turmas={turmas}
      provasPorTurma={{}}
      notasProvas={notasProvas}
      provas={provas}
      notas={notas} // <-- se precisar usar dentro do componente
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: Usuario) => u.Id === idNum);
  if (!usuario) return { notFound: true };

  const turmas = await fetchTurmasDoProfessor(idNum);
  const provaResponse: ProvaResponse = await fetchGetProva();
  const provas = provaResponse.provas || [];

  // Buscar notas
  const notas = await fetchNotas();

  return {
    props: {
      usuario,
      turmas,
      provas,
      notas,
      notasProvas: [],
    },
  };
};