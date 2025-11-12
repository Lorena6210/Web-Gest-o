import React from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { TurmaCompleta } from "@/lib/TurmaApi";
import { Prova } from "@/lib/provaApi";
import Navbar from "../Navbar";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provas: Prova[];
}

export default function ResponsavelProvasPage({ usuario, turmas, provas }: Props) {
  return (
    <Box sx={{ ml: "320px", p: 4, maxWidth: "1024px" }}>
      <Navbar usuario={usuario} turmas={turmas} />
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: "#4f46e5", textAlign: "center" }}>
        Provas dos Alunos de {usuario.Nome}
      </Typography>

      <Paper sx={{ mb: 4, p: 2, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1e3a8a" }}>
          Turmas
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#4f46e5" }}>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Nome da Turma</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Série</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {turmas.map((turma) => (
              <TableRow key={turma.idTurma} sx={{ "&:nth-of-type(odd)": { bgcolor: "#f3f4f6" } }}>
                <TableCell>{turma.nome}</TableCell>
                <TableCell>{turma.serie}ª Série</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#1e3a8a" }}>
          Provas
        </Typography>

        {provas.length === 0 ? (
          <Typography sx={{ color: "#6b7280" }}>Não há provas cadastradas.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#4f46e5" }}>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Título</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Disciplina</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Turma</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Professor</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Data de Entrega</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Descrição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {provas.map((prova) => (
                <TableRow
                  key={prova.id}
                  sx={{
                    "&:nth-of-type(odd)": { bgcolor: "#f3f4f6" },
                    "&:hover": { bgcolor: "#e0e7ff", transform: "scale(1.01)", transition: "all 0.2s" },
                  }}
                >
                  <TableCell>{prova.titulo}</TableCell>
                  <TableCell>{prova.disciplina}</TableCell>
                  <TableCell>{prova.turma}</TableCell>
                  <TableCell>{prova.professor}</TableCell>
                  <TableCell>{new Date(prova.dataEntrega).toLocaleDateString()}</TableCell>
                  <TableCell>{prova.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
