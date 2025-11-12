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
  Button,
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

interface Props {
  usuario?: {
    Nome: string;
    Id: number;
    Tipo: string;
  };
  turmas: Turma[];
  grades: (GradeCurricular & { Disciplinas: Disciplina[] })[];
}

export default function ProfessorGradeCurricular({
  usuario,
  turmas,
  grades,
}: Props) {
  const handleAtualizarDisciplina = (
    gradeId: number,
    disciplina: Disciplina
  ) => {
    const novoNome = prompt("Novo nome da disciplina:", disciplina.Nome);
    if (novoNome) {
      console.log(`Atualizada disciplina ${disciplina.Codigo} para ${novoNome}`);
    }
  };

  const handleDeletarDisciplina = (gradeId: number, codigo: string) => {
    if (confirm("Deseja realmente deletar esta disciplina?")) {
      console.log(`Deletada disciplina ${codigo}`);
    }
  };

  return (
    <Box>
      <Navbar usuario={usuario} />

      <Box
        sx={{
          mb: 3,
          mt: 2,
          marginLeft: "320px",
          paddingRight: "40px",
          maxWidth: "1024px",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ mb: 3, fontWeight: 700, color: "#4f46e5" }}
        >
          Grades Curriculares por Bimestre
        </Typography>

        {grades.map((grade) => {
          const disciplinas = grade.Disciplinas || [];
          if (disciplinas.length === 0) return null;

          const turmasIds = Array.from(new Set(disciplinas.map((d) => d.Id_Turma))).sort();

          return turmasIds.map((turmaId) => {
            const disciplinasDaTurma = disciplinas.filter((d) => d.Id_Turma === turmaId);
            const turma = turmas.find((t) => t.Id === turmaId);
            const nomeTurma = turma?.Nome || `Turma ${turmaId}`;
            const serieTurma = turma?.Serie || "-";
            const bimestres = Array.from(new Set(disciplinasDaTurma.map((d) => d.Bimestre))).sort();

            return (
              <Paper
                key={`${grade.Id_GradeCurricular}-${turmaId}`}
                sx={{
                  mb: 4,
                  p: 3,
                  borderRadius: 3,
                  boxShadow: 4,
                  bgcolor: "#ffffff",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: 8 },
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#4f46e5" }}>
                  {grade.Descricao_Grade} - {nomeTurma} ({serieTurma})
                </Typography>

                <Divider sx={{ my: 2, borderColor: "#e5e7eb" }} />

                {bimestres.map((bimestre) => {
                  const disciplinasFiltradas = disciplinasDaTurma.filter((d) => d.Bimestre === bimestre);
                  if (disciplinasFiltradas.length === 0) return null;

                  return (
                    <Box key={bimestre} sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: "#374151" }}>
                        {bimestre}º Bimestre
                      </Typography>

                      <Table
                        size="small"
                        sx={{
                          "& th": {
                            bgcolor: "#f3f4f6",
                            fontWeight: 700,
                            color: "#4f46e5",
                          },
                          "& td": {
                            color: "#374151",
                          },
                          borderRadius: 2,
                          overflow: "hidden",
                          mb: 1,
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Disciplina</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Carga Horária</TableCell>
                            <TableCell>Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {disciplinasFiltradas.map((disciplina) => (
                            <TableRow
                              key={disciplina.Codigo}
                              sx={{
                                "&:hover": { bgcolor: "#f9fafb" },
                                transition: "background 0.2s",
                              }}
                            >
                              <TableCell>{disciplina.Codigo}</TableCell>
                              <TableCell>{disciplina.Nome}</TableCell>
                              <TableCell>{disciplina.Descricao || "-"}</TableCell>
                              <TableCell>{disciplina.CargaHoraria}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  sx={{ mr: 1, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
                                  onClick={() =>
                                    handleAtualizarDisciplina(grade.Id_GradeCurricular, disciplina)
                                  }
                                >
                                  Atualizar
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  sx={{ borderColor: "#ef4444", color: "#ef4444", "&:hover": { bgcolor: "#fee2e2" } }}
                                  onClick={() =>
                                    handleDeletarDisciplina(grade.Id_GradeCurricular, disciplina.Codigo)
                                  }
                                >
                                  Deletar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          mt: 1,
                          borderColor: "#4f46e5",
                          color: "#4f46e5",
                          "&:hover": { bgcolor: "#eef2ff" },
                        }}
                        onClick={() =>
                          alert(`Cadastrar disciplina no ${bimestre}º bimestre`)
                        }
                      >
                        Cadastrar Disciplina
                      </Button>
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
