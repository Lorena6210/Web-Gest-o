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
    <div style={{marginLeft: '320px', marginTop: '20px'}}>
      <h1>Atividades</h1>

      {atividades.length === 0 && (
        <p>Não há atividades disponíveis.</p>
      )}

      {atividades.map((atividade) => (
        <div
          key={atividade.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "12px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2>{atividade.titulo}</h2>
          <p><strong>Descrição:</strong> {atividade.descricao}</p>
          <p><strong>Disciplina:</strong> {atividade.disciplina}</p>
          <p><strong>Professor:</strong> {atividade.professor}</p>
          <p><strong>Turma:</strong> {atividade.turma}</p>
          <p><strong>Data de Entrega:</strong> {atividade.dataEntrega}</p>

        </div>
      ))}
    </div>
    </Box>
  );
};

export default AtividadePage;
