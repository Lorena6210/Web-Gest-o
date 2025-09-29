// src/app/responsaveis/[id].tsx
import { GetServerSideProps } from "next";
import TodosResponsaveisPage from "@/components/Gestores/responsavel/index";
import { fetchResponsaveis, fetchResponsaveisAluno } from "@/lib/Responsaveis";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Responsavel {
  Id: number;
  Nome: string;
  Email: string;
  Senha: string;
  Telefone: string;
  Endereco: string;
  DataNascimento: string;
  Genero: string;
  FotoPerfil: string | null;
  Parentesco: string;
  Status: string;
  CPF: string;
}

interface Aluno {
  Id: number;
  Nome: string;
  RA: string;
  Id_Responsavel: number;
}

interface PageProps {
  usuario: Usuario;
  responsavel: Responsavel;
  alunos: Aluno[];
}

export default function ResponsavelPage({ usuario, responsavel, alunos }: PageProps) {
  return <TodosResponsaveisPage usuario={usuario} id={responsavel.Id} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  if (isNaN(idNum)) {
    return { notFound: true };
  }

  try {
    // Buscar o responsável pelo ID
    const responsavel: Responsavel = await fetchResponsaveis(idNum);

    if (!responsavel) {
      return { notFound: true };
    }

    // Buscar alunos vinculados
    const alunos: Aluno[] = await fetchResponsaveisAluno(idNum);

    // Aqui você poderia buscar o usuário logado, exemplo fictício:
    const usuario: Usuario = { Nome: "Gestor Exemplo", Id: 1, Tipo: "Gestor" };

    return {
      props: {
        usuario,
        responsavel,
        alunos,
      },
    };
  } catch (error) {
    console.error("Erro ao carregar dados do responsável:", error);
    return { notFound: true };
  }
};
