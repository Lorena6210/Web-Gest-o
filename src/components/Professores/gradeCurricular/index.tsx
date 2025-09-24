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
  Semestre: number;
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
  turmas: Turma[]; // turmas do professor passadas separadas
  grades: (GradeCurricular & { Disciplinas: Disciplina[] })[];
  tipoAgrupamento: "semestre" | "bimestre"; // controla o agrupamento
}

export default function ProfessorGradeCurricular({
  usuario,
  turmas,
  grades,
  tipoAgrupamento,
}: Props) {
  const handleAtualizarDisciplina = (
    gradeId: number,
    disciplina: Disciplina
  ) => {
    const novoNome = prompt("Novo nome da disciplina:", disciplina.Nome);
    if (novoNome) {
      console.log(
        `Atualizada disciplina ${disciplina.Codigo} para ${novoNome}`
      );
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
      <Box sx={{ mb: 3, mt: 2, marginLeft: "320px", paddingRight: "40px" }}>
        <Typography variant="h5" gutterBottom>
          Grades Curriculares
        </Typography>

        {grades.map((grade) => {
          const disciplinas = grade.Disciplinas || [];

          if (disciplinas.length === 0) return null;

          // Agrupar disciplinas por turma
          const turmasIds = Array.from(
            new Set(disciplinas.map((d) => d.Id_Turma))
          ).sort();

          return turmasIds.map((turmaId) => {
            const disciplinasDaTurma = disciplinas.filter(
              (d) => d.Id_Turma === turmaId
            );

            // Buscar a turma pelo array de turmas recebido via props
            const turma = turmas.find((t) => t.Id === turmaId);
            const nomeTurma = turma?.Nome || `Turma ${turmaId}`;
            const serieTurma = turma?.Serie || "-";

            // Agrupar pelo tipo selecionado (semestre ou bimestre)
            const grupos = Array.from(
              new Set(
                disciplinasDaTurma.map((d) =>
                  tipoAgrupamento === "semestre" ? d.Semestre : d.Bimestre
                )
              )
            ).sort();

            return (
              <Paper
                key={`${grade.Id_GradeCurricular}-${turmaId}`}
                sx={{ mb: 4, p: 2 }}
              >
                <Typography variant="h6" gutterBottom>
                  {grade.Descricao_Grade} - {nomeTurma} ({serieTurma})
                </Typography>

                <Divider sx={{ my: 2 }} />

                {grupos.map((grupo) => {
                  const disciplinasFiltradas = disciplinasDaTurma.filter(
                    (d) =>
                      (tipoAgrupamento === "semestre"
                        ? d.Semestre
                        : d.Bimestre) === grupo
                  );

                  if (disciplinasFiltradas.length === 0) return null;

                  return (
                    <Box key={grupo} sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {tipoAgrupamento === "semestre"
                          ? `${grupo}º Semestre`
                          : `${grupo}º Bimestre`}
                      </Typography>

                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Disciplina</TableCell>
                            <TableCell>Título</TableCell>
                            <TableCell>Carga Horária</TableCell>
                            <TableCell>Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {disciplinasFiltradas.map((disciplina) => (
                            <TableRow key={disciplina.Codigo}>
                              <TableCell>{disciplina.Codigo}</TableCell>
                              <TableCell>{disciplina.Nome}</TableCell>
                              <TableCell>
                                {disciplina.Descricao || "-"}
                              </TableCell>
                              <TableCell>{disciplina.CargaHoraria}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  sx={{ mr: 1 }}
                                  onClick={() =>
                                    handleAtualizarDisciplina(
                                      grade.Id_GradeCurricular,
                                      disciplina
                                    )
                                  }
                                >
                                  Atualizar
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() =>
                                    handleDeletarDisciplina(
                                      grade.Id_GradeCurricular,
                                      disciplina.Codigo
                                    )
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
                        sx={{ mt: 1 }}
                        onClick={() =>
                          alert(
                            `Cadastrar disciplina no ${grupo}${
                              tipoAgrupamento === "semestre"
                                ? "º semestre"
                                : "º bimestre"
                            }`
                          )
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
