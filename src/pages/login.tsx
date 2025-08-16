// pages/login.tsx
import { GetServerSideProps } from "next";
import jwtLoginStatus from "../lib/jwtLoginStatus";
import Login from "@/Views/Login";

export default function LoginPage() {
  return <Login />;
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
