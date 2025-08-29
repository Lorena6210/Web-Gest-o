// pages/login.tsx
import { GetServerSideProps } from "next";
import jwtLoginStatus from "../lib/jwtLoginStatus";
import Login from "@/Views/Login";

interface Usuario {
  Id: number;
  Nome: string;
  RA?: string;
  Email?: string;
  Status: string;
}

interface Dados {
  alunos: Usuario[];
  professores: Usuario[];
  responsaveis: Usuario[];
  gestores: Usuario[];
}

interface LoginPageProps {
  usuarios: Dados;
}

export default function LoginPage({ usuarios }: LoginPageProps) {
  return <Login usuarios={usuarios} />;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const usuario = await jwtLoginStatus(ctx);

  if (usuario) {
    // Redireciona conforme o tipo
    return {
      redirect: {
        destination: `/${usuario.Tipo}`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
