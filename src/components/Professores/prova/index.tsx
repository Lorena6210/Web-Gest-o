import React, { useState } from "react";
import { TurmaCompleta } from "@/Types/Turma";
import Navbar from "../Navbar";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { Prova } from "@/lib/provaApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  turma: TurmaCompleta;
  usuario: Usuario;
  prova: Prova[];
}

export default function ProfessorProvaPageComponent({
  usuario,
  turma,
  prova,
}: Props) {
  const [provas, setProvas] = useState<Prova[]>(prova);
  const [notas, setNotas] = useState<Record<string, number>>({});

  // Atualiza nota de um aluno
  const handleNotaChange = (alunoId: number, provaId: number, valor: string) => {
    const chave = `${alunoId}-${provaId}`;
    setNotas((prev) => ({
      ...prev,
      [chave]: parseFloat(valor),
    }));
  };

  // Salvar notas da prova
  const salvarNotas = (provaId: number) => {
    const notasProva = Object.entries(notas)
      .filter(([chave]) => chave.endsWith(`-${provaId}`))
      .map(([chave, valor]) => {
        const [alunoId] = chave.split("-");
        return { alunoId: Number(alunoId), provaId, nota: valor };
      });

    console.log(" Salvando notas:", notasProva);

    // Exemplo de chamada API:
    // fetch("http://localhost:3001/notas", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(notasProva),
    // });
  };

  // Excluir prova
  const excluirProva = (id: number) => {
    setProvas((prev) => prev.filter((p) => p.id !== id));
    console.log(" Excluir prova:", id);

    // Exemplo API:
    // fetch(`http://localhost:3001/provas/${id}`, { method: "DELETE" });
  };

  return (
    <div>
      <Navbar usuario={usuario} />
      <Box sx={{ width: "70%", margin: "20px auto", position: "relative", left: "10%" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Provas da turma {turma.Nome}
        </Typography>

        {provas.length > 0 ? (
          provas.map((p) => (
            <Accordion key={p.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ flexGrow: 1 }}>{p.titulo}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Botão excluir prova */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => excluirProva(p.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {/* Descrição da prova */}
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {p.descricao}
                </Typography>

                {/* Tabela de notas */}
                {turma.alunos && turma.alunos.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Aluno</TableCell>
                        <TableCell>Nota ({p.disciplina})</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {turma.alunos.map((aluno) => {
                        const chave = `${aluno.Id}-${p.id}`;
                        return (
                          <TableRow key={chave}>
                            <TableCell>{aluno.Nome}</TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={notas[chave] ?? ""}
                                onChange={(e) =>
                                  handleNotaChange(aluno.Id, p.id, e.target.value)
                                }
                                inputProps={{ step: 0.1, min: 0, max: 10 }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>Nenhum aluno na turma</Typography>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => salvarNotas(p.id)}
                  sx={{ mt: 2 }}
                >
                  Salvar Notas
                </Button>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Card sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Nenhuma prova cadastrada
            </Typography>
          </Card>
        )}
      </Box>
    </div>
  );
}
