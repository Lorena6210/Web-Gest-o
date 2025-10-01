// components/Aluno/gradeCurricular.tsx

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
import { TurmaCompleta } from "@/Types/Turma";
import { Disciplina } from "@/lib/disciplinaApi";

interface Usuario {
  Id: number;
  Nome: string;
  Tipo: string;
  Email: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  grades: (GradeCurricular & { Disciplinas: Disciplina[] })[];
  idTurma: number;
}

export default function AlunoGradeCurricular({
  usuario,
  turmas,
  grades,
  idTurma,
}: Props) {
  const turma = turmas.find((t) => t.Id === idTurma);

  return (
    <Box>
      <Navbar usuario={usuario} />
      <Box sx={{ mb: 3, mt: 2, marginLeft: "320px", paddingRight: "40px" }}>
        <Typography variant="h5" gutterBottom>
          Grade Curricular - {turma?.Nome} ({turma?.Serie})
        </Typography>

        {grades?.map((grade) => {
          const disciplinasDaTurma = grade.Disciplinas.filter(
            (d) => d.Id_Turma === idTurma
          );

          if (disciplinasDaTurma.length === 0) return null;

          const bimestres = Array.from(
            new Set(disciplinasDaTurma.map((d) => d.Bimestre))
          ).sort();

          return (
            <Paper key={grade.Id_GradeCurricular} sx={{ mb: 4, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {grade.Descricao_Grade}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {bimestres.map((bimestre) => {
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
        })}
      </Box>
    </Box>
  );
}
