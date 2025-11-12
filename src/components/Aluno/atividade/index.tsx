// components/Atividade/AtividadePage.tsx

import React from "react";
import { TurmaCompleta } from "@/Types/Turma";
import { Box } from "@mui/material";
import Navbar from "../Navbar";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string; // 'aluno' ou 'professor'
}

interface AtividadeDetalhada {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataEntrega: string;
  dataFinalizacao?: string;
  professor: string;
  turma: string;
  disciplina: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  atividades: AtividadeDetalhada[];
}

const AtividadePage: React.FC<Props> = ({ usuario, turmas, atividades }) => {
  const isAluno = usuario.Tipo === "aluno";

  return (
    <Box>
      <Navbar usuario={usuario} turmas={turmas} />
   <div
  style={{
    marginLeft: "320px",
    marginTop: "20px",
    maxWidth: "1024px",
    minHeight: "100vh",
    padding: "20px",
    // backgroundColor: "#f3f4f6",
  }}
>
  <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#4f46e5" }}>
    Atividades
  </h1>

  {atividades.length === 0 && (
    <p style={{ textAlign: "center", color: "#6b7280" }}>
      Não há atividades disponíveis.
    </p>
  )}

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      justifyContent: "center",
    }}
  >
    {atividades.map((atividade) => (
      <div
        key={atividade.id}
        style={{
          flex: "1 1 calc(45% - 20px)",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          padding: "20px",
          transition: "all 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 12px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
        }}
      >
        <h2 style={{ color: "#4f46e5", marginBottom: "10px" }}>{atividade.titulo}</h2>
        <p><strong>Descrição:</strong> {atividade.descricao}</p>
        <p><strong>Disciplina:</strong> {atividade.disciplina}</p>
        <p><strong>Professor:</strong> {atividade.professor}</p>
        <p><strong>Turma:</strong> {atividade.turma}</p>
        <p><strong>Data de Entrega:</strong> {atividade.dataEntrega}</p>
      </div>
    ))}
  </div>
</div>
    </Box>
  );
};

export default AtividadePage;
