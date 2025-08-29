import React, { useState } from 'react';
import { fetchCreateProfessor, fetchProfessores } from '@/lib/ProfessorApi';

export interface TurmaBasica {
  id: number;
  nome: string;
  disciplina: string;
  cor: string;
}

export interface ProfessorDataBasica {
  professor: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
  };
  turmas: TurmaBasica[];
}

export default function Professor() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [id, setId] = useState('');
  const [professor, setProfessor] = useState<ProfessorDataBasica | null>(null);

const handleSubmitCriar = async (event: { preventDefault: () => void; }) => {
  event.preventDefault();
  const professor: ProfessorDataBasica = {
    professor: {
      id: 0, // você precisa fornecer um id válido aqui
      nome,
      email,
      telefone
    },
    turmas: [], // você precisa fornecer um array de turmas aqui
  };
  try {
    const data = await fetchCreateProfessor(professor);
    console.log('Professor criado com sucesso:', data);
  } catch (error) {
    console.error('Erro ao criar professor:', error);
  }
};
const handleSubmitBuscar = async (event: { preventDefault: () => void; }) => {
  event.preventDefault();
  try {
    const data = await fetchProfessores(Number(id));
    setProfessor(data);
  } catch (error) {
    console.error('Erro ao buscar professor:', error);
  }
};

  return (
    <div>
      <h1>Professor</h1>
      <h2>Criar Professor</h2>
      <form onSubmit={handleSubmitCriar}>
        <label>
          Nome:
          <input type="text" value={nome} onChange={(event) => setNome(event.target.value)} />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <br />
        <label>
          Telefone:
          <input type="text" value={telefone} onChange={(event) => setTelefone(event.target.value)} />
        </label>
        <br />
        <button type="submit">Criar Professor</button>
      </form>
      <h2>Buscar Professor</h2>
      <form onSubmit={handleSubmitBuscar}>
        <label>
          ID:
          <input type="number" value={id} onChange={(event) => setId(event.target.value)} />
        </label>
        <br />
        <button type="submit">Buscar Professor</button>
      </form>
      {professor && (
        <div>
          <h2>Professor encontrado:</h2>
            <p>Nome: {professor.professor.nome}</p>
            <p>Email: {professor.professor.email}</p>
          <p>Telefone: {professor.professor.telefone}</p>
        </div>
      )}
    </div>
  );
}