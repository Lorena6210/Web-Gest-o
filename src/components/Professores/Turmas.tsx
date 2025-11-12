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
<div
  style={{
    display: "flex",
  }}
>
  <Navbar usuario={usuario} />
  <main
    style={{
      position: "relative",
      left: "280px",
      flex: 1,
      padding: "30px",
      maxWidth: "1024px",
    }}
  >
    {/* Campo de busca */}
    <div style={{ position: "relative", marginBottom: "30px", maxWidth: "400px" }}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar turma ou disciplina..."
        style={{
          width: "100%",
          padding: "10px 40px 10px 15px",
          borderRadius: "12px",
          border: "1px solid #ccc",
          fontSize: "16px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          transition: "all 0.25s",
        }}
      />
      <span
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "18px",
          color: "#888",
        }}
      >
        <FaMagnifyingGlass />
      </span>
    </div>

    {/* Grid de turmas */}
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "flex-start",
      }}
    >
      {turmasFiltradas.map((turma) => (
        <div
          key={turma.Id}
          style={{
            flex: "0 0 calc(30% - 20px)",
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: "#fff",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            transition: "transform 0.3s, box-shadow 0.3s, opacity 0.3s",
            cursor: "pointer",
            opacity: turma.Status === "Desativado" ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
          }}
        >
          {/* Cabeçalho com gradient */}
          <div
            style={{
              background: `linear-gradient(135deg, ${cardColors[turma.Id % cardColors.length]}, #fff)`,
              padding: "14px",
              fontWeight: "700",
              color: "#fff",
              textAlign: "center",
              fontSize: "1.2em",
              letterSpacing: "0.5px",
            }}
          >
            {turma.Nome}
          </div>

          {/* Lista de disciplinas */}
          <div
            style={{
              padding: "15px",
              fontSize: "14px",
              color: "#333",
              textAlign: "left",
              minHeight: "60px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {turma.disciplinas?.length ? (
              turma.disciplinas.map((d) => (
                <span key={d.Id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: cardColors[d.Id % cardColors.length],
                      flexShrink: 0,
                    }}
                  ></span>
                  {d.Nome}
                </span>
              ))
            ) : (
              <span style={{ fontStyle: "italic", color: "#888" }}>Nenhuma disciplina</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </main>
</div>
);
};