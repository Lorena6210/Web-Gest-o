import React from "react";
import { TurmaCompleta } from "@/lib/TurmaApi";
import { Disciplina } from "@/components/Gestores/TurmaCard";
import { GradeCurricular } from "@/lib/gradeCurricular";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import Navbar from "../Navbar";

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
  turmas: TurmaCompleta[];
  gradeCurricular: (GradeCurricular & { Disciplinas: Disciplina[] })[];
  professores: Professor[];
}

export default function ResponsavelGradeCurricularTable({
  usuario,
  turmas,
  gradeCurricular,
  professores,
}: Props) {
  const getProfessorNome = (id: number) =>
    professores.find((p) => p.Id === id)?.Nome || "Desconhecido";

  return (
    <Box sx={{ ml: "320px", p: 4, maxWidth: "1024px" }}>
      <Navbar usuario={usuario} turmas={turmas} />
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "#4f46e5", textAlign: "center" }}>
        Grade Curricular - {usuario.Nome}
      </Typography>

      {gradeCurricular.length === 0 ? (
        <Typography sx={{ color: "#6b7280" }}>Nenhuma grade curricular encontrada.</Typography>
      ) : (
        gradeCurricular.map((grade) => (
          <Paper key={grade.Id_GradeCurricular} sx={{ mb: 5, borderRadius: 3, boxShadow: 3, overflowX: "auto" }}>
            <Typography
              variant="h6"
              sx={{ p: 2, fontWeight: 600, bgcolor: "#e0e7ff", color: "#1e3a8a", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            >
              Grade #{grade.Id_GradeCurricular} - {grade.Descricao_Grade}
            </Typography>

            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#4f46e5" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Código</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Disciplina</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Carga Horária</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Bimestre</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Professor</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {grade.Disciplinas.map((disc) => (
                  <TableRow
                    key={disc.Id_Disciplina}
                    sx={{
                      "&:nth-of-type(odd)": { bgcolor: "#f3f4f6" },
                      "&:hover": { bgcolor: "#e0e7ff", transform: "scale(1.01)", transition: "all 0.2s" },
                    }}
                  >
                    <TableCell>{disc.Codigo}</TableCell>
                    <TableCell>{disc.Nome}</TableCell>
                    <TableCell>{disc.CargaHoraria}h</TableCell>
                    <TableCell>{disc.Bimestre}</TableCell>
                    <TableCell>{getProfessorNome(disc.Id_Professor)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ))
      )}
    </Box>
  );
}
