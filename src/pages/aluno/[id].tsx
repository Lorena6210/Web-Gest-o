import { GetServerSideProps } from 'next';
import AlunoPage from '@/components/Aluno/AlunoPage';
import { fetchUsuarios } from '@/lib/UsuarioApi';
import { fetchTurmaDoAluno } from '@/lib/TurmaApi';
import { TurmaCompleta } from '@/Types/Turma';

interface Usuario {
  Nome: string;
  Id: number;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function PaginaAluno({ usuario, turmas }: Props) {
  return <AlunoPage usuario={usuario} turmas={turmas} />;
}

export const getServerSideProps: GetServerSideProps<{ usuario: Usuario | null; turmas: TurmaCompleta[] }> = async (context) => {
  const { id, disciplina } = context.query;  // pegando disciplina da query

  if (!id || Array.isArray(id)) {
    return { props: { usuario: null, turmas: [] as TurmaCompleta[] } };
  }

  const idAluno = Number(id);
  const idDisciplina = disciplina ? Number(disciplina) : undefined;

  const usuarios = await fetchUsuarios();
  const usuario: Usuario = usuarios.alunos?.find((u: Usuario) => u.Id === idAluno);

  if (!usuario) {
    return { props: { usuario: null, turmas: [] } };
  }

    const turma = await fetchTurmaDoAluno(idAluno, idDisciplina);
    const turmas = turma ? [turma] : [];
  return {
    props: {
      usuario,
      turmas,
    },
  };
};