<<<<<<< HEAD
import React from "react";
=======
// components/Aluno/gestorGradeCurricular.tsx
import React, { useState, useMemo } from "react";
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f
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
<<<<<<< HEAD
=======
  FormControl,
  InputLabel,
  Select,
  MenuItem,
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f
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

<<<<<<< HEAD
export default function AlunoGradeCurricular({
 usuario,
  turmas,
  gradeCurricular,
}: Props) {
  return (
    <Box>
      <Navbar usuario={usuario} />
      <Box sx={{ mb: 3, mt: 2, marginLeft: "320px", paddingRight: "40px" }}>
        <Typography variant="h5" gutterBottom>
          Grades Curriculares por Bimestre
        </Typography>

        {gradeCurricular?.map((grade) => {
          const disciplinas = grade.Disciplinas || [];

          if (disciplinas.length === 0) return null;
=======
export default function GestorGradeCurricular({
  usuario,
  turmas,
  gradeCurricular,
}: Props) {
  const [selectedTurma, setSelectedTurma] = useState<number | "Todos">("Todos");
  const [selectedSemestre, setSelectedSemestre] = useState<number | "Todos">("Todos");
  const [selectedBimestre, setSelectedBimestre] = useState<number | "Todos">("Todos");

  // Gerar opções únicas de semestre e bimestre
  const semestres = useMemo(() => {
    const allSemestres = gradeCurricular.flatMap((g) =>
      g.Disciplinas.map((d) => d.Semestre)
    );
    return Array.from(new Set(allSemestres)).sort((a, b) => a - b);
  }, [gradeCurricular]);

  const bimestres = useMemo(() => {
    const allBimestres = gradeCurricular.flatMap((g) =>
      g.Disciplinas.map((d) => d.Bimestre)
    );
    return Array.from(new Set(allBimestres)).sort((a, b) => a - b);
  }, [gradeCurricular]);

  // Filtrar grades com base nos filtros
  const filteredGrades = useMemo(() => {
    return gradeCurricular.map((grade) => {
      const disciplinasFiltradas = grade.Disciplinas.filter((d) => {
        const matchTurma =
          selectedTurma === "Todos" ? true : d.Id_Turma === selectedTurma;
        const matchSemestre =
          selectedSemestre === "Todos" ? true : d.Semestre === selectedSemestre;
        const matchBimestre =
          selectedBimestre === "Todos" ? true : d.Bimestre === selectedBimestre;
        return matchTurma && matchSemestre && matchBimestre;
      });
      return { ...grade, Disciplinas: disciplinasFiltradas };
    }).filter((g) => g.Disciplinas.length > 0);
  }, [gradeCurricular, selectedTurma, selectedSemestre, selectedBimestre]);

  return (
    <Box>
      <Navbar usuario={usuario} />

      <Box sx={{ mb: 3, mt: 2, marginLeft: "320px", paddingRight: "40px" }}>
        <Typography variant="h5" gutterBottom>
          Grades Curriculares
        </Typography>

        {/* Filtros */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Turma</InputLabel>
            <Select
              value={selectedTurma}
              label="Turma"
              onChange={(e) =>
                setSelectedTurma(
                  e.target.value === "Todos" ? "Todos" : Number(e.target.value)
                )
              }
            >
              <MenuItem value="Todos">Todos</MenuItem>
              {turmas.map((t) => (
                <MenuItem key={t.Id} value={t.Id}>
                  {t.Nome} ({t.Serie})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Semestre</InputLabel>
            <Select
              value={selectedSemestre}
              label="Semestre"
              onChange={(e) =>
                setSelectedSemestre(
                  e.target.value === "Todos" ? "Todos" : Number(e.target.value)
                )
              }
            >
              <MenuItem value="Todos">Todos</MenuItem>
              {semestres.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}º Semestre
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Bimestre</InputLabel>
            <Select
              value={selectedBimestre}
              label="Bimestre"
              onChange={(e) =>
                setSelectedBimestre(
                  e.target.value === "Todos" ? "Todos" : Number(e.target.value)
                )
              }
            >
              <MenuItem value="Todos">Todos</MenuItem>
              {bimestres.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}º Bimestre
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Grades filtradas */}
        {filteredGrades.map((grade) => {
          const disciplinas = grade.Disciplinas || [];
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f

          const turmasIds = Array.from(
            new Set(disciplinas.map((d) => d.Id_Turma))
          ).sort();

          return turmasIds.map((turmaId) => {
            const disciplinasDaTurma = disciplinas.filter(
              (d) => d.Id_Turma === turmaId
            );
<<<<<<< HEAD

            const turma = turmas?.find((t) => t.Id === turmaId);
            const nomeTurma = turma?.Nome || `Turma ${turmaId}`;
            const serieTurma = turma?.Serie || "-";

            const bimestres = Array.from(
=======
            const turma = turmas.find((t) => t.Id === turmaId);
            const nomeTurma = turma?.Nome || `Turma ${turmaId}`;
            const serieTurma = turma?.Serie || "-";

            const bimestresTurma = Array.from(
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f
              new Set(disciplinasDaTurma.map((d) => d.Bimestre))
            ).sort();

            return (
              <Paper
                key={`${grade.Id_GradeCurricular}-${turmaId}`}
<<<<<<< HEAD
                sx={{ mb: 4, p: 2 }}
=======
                sx={{ mb: 4, p: 2, overflowX: "auto" }}
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f
              >
                <Typography variant="h6" gutterBottom>
                  {grade.Descricao_Grade} - {nomeTurma} ({serieTurma})
                </Typography>

                <Divider sx={{ my: 2 }} />

<<<<<<< HEAD
                {bimestres.map((bimestre) => {
=======
                {bimestresTurma.map((bimestre) => {
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f
                  const disciplinasFiltradas = disciplinasDaTurma.filter(
                    (d) => d.Bimestre === bimestre
                  );

                  if (disciplinasFiltradas.length === 0) return null;

                  return (
                    <Box key={bimestre} sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {bimestre}º Bimestre
                      </Typography>

                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Disciplina</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Carga Horária</TableCell>
<<<<<<< HEAD
=======
                            <TableCell>Semestre</TableCell>
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {disciplinasFiltradas.map((disciplina) => (
<<<<<<< HEAD
                            <TableRow key={disciplina.Codigo}>
=======
                            <TableRow
                              key={disciplina.Codigo}
                              sx={{ "&:hover": { backgroundColor: "#f0f8ff" } }}
                            >
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f
                              <TableCell>{disciplina.Codigo}</TableCell>
                              <TableCell>{disciplina.Nome}</TableCell>
                              <TableCell>{disciplina.Descricao || "-"}</TableCell>
                              <TableCell>{disciplina.CargaHoraria}</TableCell>
<<<<<<< HEAD
=======
                              <TableCell>{disciplina.Semestre}</TableCell>
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f
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
<<<<<<< HEAD
      </Box>
    </Box>
  );
}
=======

        {filteredGrades.length === 0 && (
          <Typography sx={{ mt: 4 }} color="text.secondary">
            Nenhuma disciplina encontrada com os filtros aplicados.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
>>>>>>> d68c3206b4398d4e464e90d5c80083212044ab8f
