import React, { useState } from "react";
import { fetchCreateProfessor, fetchProfessores } from "@/lib/ProfessorApi";

export default function Professor() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [id, setId] = useState("");
  const [professor, setProfessor] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const handleSubmitCriar = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!nome || !email || !telefone || !senha) {
      setErro("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const novoProfessor = { nome, email, telefone, senha };
      const data = await fetchCreateProfessor(novoProfessor);

      setMensagem(`Professor criado com sucesso! ID: ${data.id}`);
      setNome("");
      setEmail("");
      setTelefone("");
      setSenha("");
    } catch (error: any) {
      setErro(error.message || "Erro ao criar professor");
    }
  };

  const handleSubmitBuscar = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro(null);
    setMensagem(null);

    try {
      const data = await fetchProfessores(Number(id));
      setProfessor(data);
    } catch (error: any) {
      setErro(error.message || "Erro ao buscar professor");
    }
  };

  return (
    <div>
      <h1>Professor</h1>

      <h2>Criar Professor</h2>
      <form onSubmit={handleSubmitCriar}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <br />
        <button type="submit">Criar Professor</button>
      </form>

      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}

      <h2>Buscar Professor</h2>
      <form onSubmit={handleSubmitBuscar}>
        <input
          type="number"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <br />
        <button type="submit">Buscar Professor</button>
      </form>

      {professor && (
        <div>
          <h2>Professor encontrado:</h2>
          <p>Nome: {professor.nome}</p>
          <p>Email: {professor.email}</p>
          <p>Telefone: {professor.telefone}</p>
        </div>
      )}
    </div>
  );
}
