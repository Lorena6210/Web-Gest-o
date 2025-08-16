// lib/jwtLoginStatus.ts
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import nookies, { parseCookies } from "nookies";

export type Usuario = {
  Id: number;
  Nome: string;
  Tipo: "aluno" | "professor" | "responsavel" | "gestor";
};

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

    if (response.data && response.data.usuario) {
      return response.data.usuario as Usuario;
    }
    return null;
  } catch (error) {
    console.error("Erro ao verificar status de login:", error);
    return null;
  }
}
