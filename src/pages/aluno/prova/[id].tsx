// pages/professor/[id].tsx
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta } from "@/lib/TurmaApi"; // Assumindo que funciona para professor (turmas que ele leciona)
import { TurmaCompleta } from "@/Types/Turma";
import { Prova, fetchProvasCompleto, NotaProva, fetchNotasProva } from "@/lib/provaApi";
import AlunoPageComponent from "@/components/Aluno/prova"; // Novo componente para professor

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

  // Buscar usuário como professor
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: Usuario) => u.Id === idNum); // Ajuste para professores
  if (!usuario) return { notFound: true };

  // Buscar turmas do professor (assumindo que fetchTurmaCompleta(idProfessor) retorna turmas que ele leciona)
  let turmas = await fetchTurmaCompleta(idNum);
  turmas = Array.isArray(turmas) ? turmas : turmas ? [turmas] : [];

  // Buscar provas completas de todas as turmas do professor
  let provas: Prova[] = [];
  for (const turma of turmas) {
    try {
      const provasDaTurma = await fetchProvasCompleto(turma.Id);
      if (Array.isArray(provasDaTurma)) provas = provas.concat(provasDaTurma);
    } catch (error) {
      console.error(`Erro ao buscar provas da turma ${turma.Id}`, error);
    }
  }

  // Buscar notas das provas do professor (filtro por Id_Professor === usuario.Id)
  // Isso puxa todas as notas das provas, mas filtra apenas as do professor logado
  // Inclui nome da prova (TituloProva), nota (Valor), disciplina (NomeDisciplina), aluno (NomeAluno)
  let notas: NotaProva[] = [];
  for (const prova of provas) {
    try {
      const notasProva = await fetchNotasProva(prova.Id); // Sem filtro de bimestre; ajuste se necessário
      // Filtrar apenas as notas do professor atual (todas as notas dos alunos nessa prova, se o professor é o responsável)
      const notasProfessor = notasProva.filter((n: NotaProva) => n.Id_Professor === usuario.Id);
      // Opcional: Filtro por bimestre aqui (ex: 1º Bimestre)
      // const notasProfessor = notasProva.filter((n: NotaProva) => n.Id_Professor === usuario.Id && n.Id_Bimestre === 1);
      notas = notas.concat(notasProfessor);
    } catch (error) {
      console.error(`Erro ao buscar notas da prova ${prova.Id}`, error);
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
