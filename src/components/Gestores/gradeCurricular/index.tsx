import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider,
} from "@mui/material";
import Navbar from "../Navbar";
import { GradeCurricular } from "@/lib/gradeCurricular";

interface Turma {
  Id: number;
  Nome: string;
  Serie: string;
  AnoLetivo: number;
  Turno: string;
  Sala: string;
}

interface Disciplina {
  Codigo: string;
  Nome: string;
  CargaHoraria: number;
  Bimestre: number;
  Descricao?: string;
  Id_Turma: number;
}

interface Usuario {
  Id: number;
  Nome: string;
  Tipo: string;
}

interface Professor {
  Id: number;
  Nome: string;
  Email: string;
  Telefone?: string;
}

interface Props {
  usuario: Usuario;
  turmas: Turma[];
  gradeCurricular: (GradeCurricular & { Disciplinas: Disciplina[] })[];
  disciplinas: Disciplina[];
  professores: Professor[];
}

export default function GestorGradeCurricular({
  usuario,
  turmas,
  gradeCurricular,
}: Props) {
  return (
    <Box>
      <Navbar usuario={usuario} />

      {/* Container principal */}
      <Box
        sx={{
          mb: 3,
          mt: 2,
          ml: "320px",
          pr: "40px",
          maxWidth: "1024px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 700, color: "#4F46E5" }}
        >
          Grades Curriculares por Bimestre
        </Typography>

        {gradeCurricular?.map((grade) => {
          const disciplinas = grade.Disciplinas || [];
          if (disciplinas.length === 0) return null;

          const turmasIds = Array.from(
            new Set(disciplinas.map((d) => d.Id_Turma))
          ).sort();

          return turmasIds.map((turmaId) => {
            const disciplinasDaTurma = disciplinas.filter(
              (d) => d.Id_Turma === turmaId
            );
            const turma = turmas?.find((t) => t.Id === turmaId);
            const nomeTurma = turma?.Nome || `Turma ${turmaId}`;
            const serieTurma = turma?.Serie || "-";

            const bimestres = Array.from(
              new Set(disciplinasDaTurma.map((d) => d.Bimestre))
            ).sort();

            return (
              <Paper
                key={`${grade.Id_GradeCurricular}-${turmaId}`}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#4F46E5", mb: 2 }}
                >
                  {grade.Descricao_Grade} - {nomeTurma} ({serieTurma})
                </Typography>

                <Divider sx={{ my: 2, borderColor: "#E5E7EB" }} />

                {bimestres.map((bimestre) => {
                  const disciplinasFiltradas = disciplinasDaTurma.filter(
                    (d) => d.Bimestre === bimestre
                  );
                  if (disciplinasFiltradas.length === 0) return null;

                  return (
                    <Box key={bimestre} sx={{ mt: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        {bimestre}º Bimestre
                      </Typography>

                      <Table
                        size="small"
                        sx={{
                          width: "100%",
                          borderCollapse: "collapse",
                          "& th": {
                            backgroundColor: "#EDE9FE",
                            color: "#4F46E5",
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                          },
                          "& td": {
                            px: 2,
                            py: 1,
                          },
                          "& tr:hover": {
                            backgroundColor: "#F3F4F6",
                          },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Disciplina</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Carga Horária</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {disciplinasFiltradas.map((disciplina) => (
                            <TableRow key={disciplina.Codigo}>
                              <TableCell>{disciplina.Codigo}</TableCell>
                              <TableCell>{disciplina.Nome}</TableCell>
                              <TableCell>{disciplina.Descricao || "-"}</TableCell>
                              <TableCell>{disciplina.CargaHoraria}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  );
                })}
              </Paper>
            );
          });
        })}
      </Box>
    </Box>
  );
}

