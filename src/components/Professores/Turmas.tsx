import React, { useState, useMemo } from "react";
import { TurmaCompleta, } from '@/Types/Turma';
import Navbar from "./Navbar";
import { FaMagnifyingGlass } from "react-icons/fa6";


// Paleta de cores para os cards
const cardColors = [
  "#f06292", // rosa
  "#26a69a", // verde água
  "#fdd835", // amarelo
  "#ef5350", // vermelho
  "#8bc34a", // verde limão
  "#ff7043", // laranja
];

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function Turmas({ usuario, turmas }: Props) {
  const [search, setSearch] = useState("");

  // Filtra só turmas do professor logado
  const turmasDoProfessor = useMemo(() => {
    return turmas.filter((turma) =>
      turma.professores?.some((prof) => prof.Id === usuario.Id)
    );
  }, [turmas, usuario.Id]);

  // Filtra por busca
  const turmasFiltradas = useMemo(() => {
    const searchLower = search.toLowerCase();

    if (!Array.isArray(turmasDoProfessor) || searchLower.trim() === "") {
      return turmasDoProfessor;
    }

    return turmasDoProfessor.filter((turma) => {
      const nomeMatch =
        turma.Nome?.toLowerCase().includes(searchLower) ?? false;
      const disciplinaMatch =
        Array.isArray(turma.disciplinas) &&
        turma.disciplinas.some((d) =>
          d?.Nome?.toLowerCase().includes(searchLower)
        );

      return nomeMatch || disciplinaMatch;
    });
  }, [search, turmasDoProfessor]);

  return (
 <div style={{  display: 'flex', maxWidth:"100%", width: '100%', height: '90vh', fontFamily: 'Arial, sans-serif',}}>
   <Navbar usuario={usuario} />
  <main style={{ flex: 1, padding: '30px',}}>
   {/* Campo de busca */}
  <div style={{ position: 'relative', marginBottom: '30px',maxWidth: '400px',}}>
   <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." style={{ width: '100%', padding: '10px 40px 10px 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px',}} />
    <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '18px', color: '#888',}}>
     <FaMagnifyingGlass />
    </span>
   </div>
    <div
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
      }}
    >
      {turmasFiltradas.map((turma) => (
        <div
          key={turma.Id}
          style={{
            marginBottom: "10px",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#bdbdbd",
            flex: '0 0 calc(30% - 1px)',

          }}
        >
          {/* Cabeçalho */}
          <div
            style={{
              backgroundColor: "#bdbdbd",
              padding: "10px",
              fontWeight: "bold",
            }}
          >
            {turma.Nome}
          </div>

          {/* Disciplinas */}
          <div style={{ padding: "10px", fontSize: 14, color: "#333" }}>
            {turma.disciplinas?.length
              ? turma.disciplinas.map((d) => d.Nome).join(", ")
              : "Nenhuma disciplina"}
          </div>

          {/* Rodapé */}
          <div
            style={{
              padding: "8px 10px",
              color: "#fff",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              backgroundColor: cardColors[turma.Id % cardColors.length],
            }}
          >
            <span>Conteúdo</span>
            <span>Notas</span>
          </div>
        </div>
      ))}
    </div>
  </main>
</div>
  );
}
