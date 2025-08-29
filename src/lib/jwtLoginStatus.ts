// lib/jwtLoginStatus.ts
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import nookies, { parseCookies } from "nookies";

export type Usuario = {
  Id: number;
  Nome: string;
  Tipo: "aluno" | "professor" | "responsavel" | "gestor";
};

// interface ResponseData {
//   usuario?: Usuario; // A propriedade 'usuario' é opcional
// }

export default async function jwtLoginStatus(
  ctx: GetServerSidePropsContext
): Promise<Usuario | null> {
  const cookies = ctx ? nookies.get(ctx) : parseCookies();
  const token = cookies["usrses"]; // nome do cookie com token

  if (!token) {
    return null;
  }

  try {
    const response = await axios.get("http://localhost:3001/login/status", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if ((response.data as { usuario: Usuario }).usuario) {
      return (response.data as { usuario: Usuario }).usuario;
    }
    return null;
  } catch (error) {
    console.error("Erro ao verificar status de login:", error);
    return null;
  }
}
