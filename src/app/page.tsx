"use client";

import LoginPage from "@/Views/Login";
import { fetchUsuarios } from "../lib/UsuarioApi";
import { useEffect, useState } from "react";

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

export default function App() {
  const [usuarios, setUsuarios] = useState<Dados | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const dados = await fetchUsuarios();
        setUsuarios(dados);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar usuários.");
      } finally {
        setLoading(false);
      }
    };

    carregarUsuarios();
  }, []);

  if (loading) return <div>Carregando usuários...</div>;
  if (error) return <div>{error}</div>;
  if (!usuarios) return <div>Nenhum usuário encontrado.</div>;

  return <LoginPage usuarios={usuarios} />;
}
