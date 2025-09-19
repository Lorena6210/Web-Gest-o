import React, { useMemo } from "react";
import Navbar from "../Navbar";
import { Box } from "@mui/material";
import { GradeCurricular, Professor } from "@/lib/gradeCurricular";
import { Disciplina } from '../../../components/Gestores/TurmaCard';

interface Usuario {
  Nome: string;
  Id: number;
}

interface Props {
  usuario: Usuario[];
  gradeCurricular: GradeCurricular[];
  disciplinas: Disciplina[];
  professores: Professor[];
}

const TabelaDisciplinas: React.FC<{ disciplinas: GradeCurricular[] }> = ({ disciplinas }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
    <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
      <tr>
        <th style={{ padding: 8, textAlign: "center" }}>Código</th>
        <th style={{ padding: 8 }}>Disciplina</th>
        <th style={{ padding: 8, textAlign: "center" }}>Crédito</th>
        <th style={{ padding: 8, textAlign: "center" }}>Professor</th>
      </tr>
    </thead>
    <tbody>
      {disciplinas.map((grade) => (
        <tr key={grade.Id_Disciplina} style={{ borderBottom: "1px solid #ddd" }}>
          <td style={{ padding: 8, textAlign: "center" }}>{grade.Codigo_Disciplina}</td>
          <td style={{ padding: 8 }}>{grade.Nome_Disciplina}</td>
          <td style={{ padding: 8, textAlign: "center" }}>{grade.Credito ?? "-"}</td>
          <td style={{ padding: 8 }}>{grade.Nome_Professor}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default function GestorGradeCurricular({ usuario, gradeCurricular }: Props) {
  // Agrupa os semestres e ordena
  const semestres = useMemo(() => {
    return Array.from(new Set(gradeCurricular.map((g) => g.Semestre))).sort((a, b) => a - b);
  }, [gradeCurricular]);

  return (
    <Box p={3}>
      <Navbar usuario={usuario} />

      <Box sx={{ maxWidth: 800, mb: 3, margin: "0 auto" }}>
        <h2>Grade Curricular (Visualização)</h2>
      </Box>

      {semestres.map((semestre) => {
        const disciplinasDoSemestre = gradeCurricular.filter((g) => g.Semestre === semestre);
        return (
          <Box key={semestre} sx={{ mb: 4, maxWidth: 800, margin: "0 auto" }}>
            <h3
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                padding: "8px",
                borderRadius: "4px",
                userSelect: "none",
              }}
            >
              {semestre}º Semestre
            </h3>

            <TabelaDisciplinas disciplinas={disciplinasDoSemestre} />
          </Box>
        );
      })}
    </Box>
  );
}
