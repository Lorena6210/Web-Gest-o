import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmasDoProfessor } from '@/lib/TurmaApi';
import { TurmaCompleta } from '@/Types/Turma';
import { 
  fetchProvas, 
  fetchNotasProva, 
  Prova, 
  NotaProva 
} from '@/lib/provaApi';
import ProfessorProvaPageComponent from "@/components/Professores/prova";

interface Usuario {
    Nome: string;
    Id: number;
    Tipo: string;
}

interface Props {
    usuario: Usuario;
    turma: TurmaCompleta;  
    provasPorBimestre: Record<number, Prova[]>; // separadas por bimestre
    notasProvas: NotaProva[];
}

export default function ProfessorProvaPage({ usuario, turma, provasPorBimestre, notasProvas }: Props) {
  return (
    <ProfessorProvaPageComponent 
      usuario={usuario} 
      turma={turma} 
      provasPorBimestre={provasPorBimestre} 
      notasProvas={notasProvas} 
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  // Buscar professor
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.professores?.find((u: { Id: number }) => u.Id === idNum);
  if (!usuario) return { notFound: true };

  // Buscar turmas do professor
  const turmas = await fetchTurmasDoProfessor(idNum);
  const turma = turmas[0];
  if (!turma) return { notFound: true };

  // Buscar todas as provas da turma
// Buscar todas as provas da turma
const provasResponse = await fetchProvas(turma.Id);
const provas: Prova[] = Array.isArray(provasResponse) ? provasResponse : provasResponse?.provas || [];

// Buscar notas de todas as provas
const notasProvasArrays = await Promise.all(provas.map(p => fetchNotasProva(p.id)));
const notasProvas = notasProvasArrays.flat(); // achata array de arrays


  // Separar provas por bimestre (exemplo simples: bimestre 1-4 baseado no mês)
  const provasPorBimestre: Record<number, Prova[]> = {};
  provas.forEach(p => {
    const dataEntrega = p.dataEntrega ? new Date(p.dataEntrega) : new Date();
    const mes = dataEntrega.getMonth(); // 0-11
    const bimestre = Math.floor(mes / 2) + 1; // 1-6 => 1-3?
    if (!provasPorBimestre[bimestre]) provasPorBimestre[bimestre] = [];
    provasPorBimestre[bimestre].push(p);
  });

  return {
    props: { 
      usuario, 
      turma, 
      provasPorBimestre,
      notasProvas
    },
  };
};
