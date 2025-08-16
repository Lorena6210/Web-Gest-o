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

interface Props {
  usuarios: Dados;
}

export default function App() {
  const [usuarios, setUsuarios] = useState<Dados | null>(null);

  useEffect(() => {
    fetchUsuarios().then(setUsuarios).catch(console.error);
  }, []);

  if (!usuarios) return <div>Carregando usuários...</div>;

  return <LoginPage usuarios={usuarios} />;
}
