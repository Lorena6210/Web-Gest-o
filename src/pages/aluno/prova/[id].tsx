// pages/aluno/[id].tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";
import { NotaProva, fetchGetProva } from "@/lib/provaApi";
import { fetchNotas } from "@/lib/NotasApi";
import AlunoViewComponent from "@/components/Aluno/prova/index";

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
  notas: NotaProva[];
}

export default function AlunoPageContainer({ usuario, turmas, provas, notas }: Props) {
  return (
    <AlunoViewComponent usuario={usuario} turmas={turmas} provas={provas} notas={notas} />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (!id || isNaN(idNum)) {
    return { notFound: true };
  }

  // Buscar usuário como aluno
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.alunos?.find((u: Usuario) => u.Id === idNum);
  if (!usuario) return { notFound: true };

  // Buscar turma do aluno
  let turmas = await fetchTurmaCompleta(idNum);
  turmas = Array.isArray(turmas) ? turmas : turmas ? [turmas] : [];

  // Buscar provas
  const provaResponse: ProvaResponse = await fetchGetProva();
  const provas = provaResponse.provas || [];

  // Buscar notas
  let notas = await fetchNotas();
  notas = Array.isArray(notas) ? notas : notas ? [notas] : [];

  return {
    props: {
      usuario,
      turmas,
      provas,
      notas,
    },
  };
};