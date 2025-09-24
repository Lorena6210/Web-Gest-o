// pages/aluno/[id].tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta } from "@/lib/TurmaApi";
import { TurmaCompleta } from "@/Types/Turma";
import { Prova, fetchProvasCompleto, NotaProva, fetchNotasProva } from "@/lib/provaApi";
import AlunoPageComponent from "@/components/Aluno/prova";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provas: Prova[];
  notas: NotaProva[];
}

export default function AlunoPageContainer({ usuario, turmas, provas, notas }: Props) {
  return (
    <AlunoPageComponent usuario={usuario} turmas={turmas} provas={provas} notas={notas} />
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
  if (!usuario) return { notFound: true };

  // Buscar turmas do aluno
  let turmas = await fetchTurmaCompleta(idNum);
  turmas = Array.isArray(turmas) ? turmas : turmas ? [turmas] : [];

  // Buscar provas e notas
  let provas: Prova[] = [];
  let notas: NotaProva[] = [];

  for (const turma of turmas) {
    try {
      const provasDaTurma = await fetchProvasCompleto(turma.Id);
      if (Array.isArray(provasDaTurma)) {
        provas = provas.concat(provasDaTurma);

        for (const prova of provasDaTurma) {
          try {
            const notasDaProva = await fetchNotasProva(prova.id);
            if (Array.isArray(notasDaProva)) {
              notas = notas.concat(notasDaProva);
            }
          } catch (error) {
            console.error(`Erro ao buscar notas da prova ${prova.id}`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar provas da turma ${turma.Id}`, error);
    }
  }

  return {
    props: {
      usuario,
      turmas,
      provas,
      notas,
    },
  };
};
