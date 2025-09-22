// components/responsavel/ResponsavelPage.tsx

import React from "react";
import Navbar from "../Navbar";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { TurmaCompleta } from "@/lib/TurmaApi"; 
import { Aluno, Disciplina } from "@/lib/BoletimApi"; 
import { Boletim } from "@/lib/BoletimApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  boletins: Boletim[];
}

export default function ResponsavelPageComponent({ usuario, turmas, boletins }: Props) {
  // Pega lista de alunos do responsável
  const alunos = turmas.flatMap(t => t.alunos || []);

  return (
    <div>
      <Navbar usuario={usuario} />
      <Box sx={{ width: "90%", mx: "auto", mt: 4, px: 2 }}>
        <Typography variant="h4" gutterBottom>
          Boletim de {usuario.Nome}
        </Typography>

        {alunos.length === 0 ? (
          <Typography>Nenhum aluno vinculado.</Typography>
        ) : (
          alunos.map(aluno => (
            <Box key={aluno.Id} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {aluno.Nome}
              </Typography>
              <Paper elevation={2} sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bimestre</TableCell>
                      <TableCell>Disciplina</TableCell>
                      <TableCell>Média Atividades</TableCell>
                      <TableCell>Média Provas</TableCell>
                      <TableCell>Média Final</TableCell>
                      <TableCell>Situação</TableCell>
                      <TableCell>Observações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {boletins
                      .filter(b => b.Id_Aluno === aluno.Id)
                      .map(b => (
                        <TableRow key={`${aluno.Id}-${b.Id_Disciplina}-${b.Id_Bimestre}`}>
                          <TableCell>{b.Id_Bimestre}º</TableCell>
                          <TableCell>{b.Id_Disciplina}</TableCell> {/* ou nome da disciplina, se você tiver */}
                          <TableCell>{parseFloat(b.MediaAtividades).toFixed(2)}</TableCell>
                          <TableCell>{parseFloat(b.MediaProvas).toFixed(2)}</TableCell>
                          <TableCell>{parseFloat(b.MediaFinal).toFixed(2)}</TableCell>
                          <TableCell>{b.Situacao}</TableCell>
                          <TableCell>{b.Observacoes}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ))
        )}
      </Box>
    </div>
  );
}
