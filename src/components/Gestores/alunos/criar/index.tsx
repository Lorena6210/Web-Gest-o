"use client";

import React, { useEffect, useState } from "react";
import { fetchAlunos, createAluno } from "@/lib/AlunoApi";
import Navbar from "../../Navbar";
import { Usuario } from "@/lib/jwtLoginStatus";
import { TurmaCompleta } from "@/Types/Turma";

interface Aluno {
  Nome: string;
  CPF: string;
  Senha: string;
  RA: string;
  Id: number;
  Telefone: string
  DataNascimento: string
  Genero: string
  FotoPerfil: string
  Status: string
}
interface CriarAlunoProps {
  usuario: Usuario;
}

const CriarAluno: React.FC<CriarAlunoProps> = ({ usuario,}) => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [form, setForm] = useState({
    Nome: "",
    CPF: "",
    Senha: "",
    RA: ""
  });

  // Buscar alunos ao carregar
  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await fetchAlunos();
        setAlunos(data);
      } catch (error) {
        console.error(error);
      }
    };
    carregar();
  }, []);

  // Handler criação aluno
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const aluno: Aluno = {
      ...form,
      Telefone: '', 
      DataNascimento: '', 
      Genero: '',
      FotoPerfil: '',
      Status: '',
      RA: '',
      Id: 0, // Adicione a propriedade Id com um valor padrão
    };
    const alton = {
      Nome: aluno.Nome,
      CPF: aluno.CPF,
      Senha: aluno.Senha,
      Telefone: aluno.Telefone,
      DataNascimento: aluno.DataNascimento,
      Genero: aluno.Genero,
      FotoPerfil: aluno.FotoPerfil,
      Status: aluno.Status,
      RA: aluno.RA
    };
    const novo = await createAluno(alton);
    alert("Aluno criado com sucesso!");
    setAlunos([...alunos, { ...aluno, Id: novo.id }]);
    setForm({ Nome: "", CPF: "", Senha: "", RA: "" });
  } catch (error) {
    console.error(error);
    alert("Erro ao criar aluno");
  }
};

  return (
    <div className="p-6">
      <Navbar usuario={usuario} />
      <h1 className="text-xl font-bold mb-4">Gerenciar Alunos</h1>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Nome"
          value={form.Nome}
          onChange={(e) => setForm({ ...form, Nome: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="CPF"
          value={form.CPF}
          onChange={(e) => setForm({ ...form, CPF: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.Senha}
          onChange={(e) => setForm({ ...form, Senha: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="RA"
          value={form.RA}
          onChange={(e) => setForm({ ...form, RA: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Criar Aluno
        </button>
      </form>

      {/* Listagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alunos.map((aluno) => (
          <div
            key={aluno.Id}
            className="p-4 border rounded shadow bg-white"
          >
            <h2 className="font-semibold">{aluno.Nome}</h2>
            <p>RA: {aluno.RA}</p>
            <p>CPF: {aluno.CPF}</p>
            <p>Status: {aluno.Status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CriarAluno;