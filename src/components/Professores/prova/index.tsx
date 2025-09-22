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
import { Prova, NotaProva } from "@/lib/provaApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  turma: TurmaCompleta;
  usuario: Usuario;
  provasPorBimestre: Record<number, Prova[]>;
  notasProvas: NotaProva[];
}

export default function ProfessorProvaPageComponent({
  usuario,
  turma,
  provasPorBimestre,
  notasProvas,
}: Props) {
  const [provas, setProvas] = useState<Prova[]>(
    Object.values(provasPorBimestre).flat()
  );

  const [notas, setNotas] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    notasProvas.forEach(n => {
      const chave = `${n.Id_Aluno}-${n.Id_Prova}`;
      map[chave] = n.Valor;
    });
    return map;
  });

  const handleNotaChange = (alunoId: number, provaId: number, valor: string) => {
    const chave = `${alunoId}-${provaId}`;
    setNotas(prev => ({ ...prev, [chave]: parseFloat(valor) }));
  };

  const salvarNotas = (provaId: number) => {
    const notasProva = Object.entries(notas)
      .filter(([chave]) => chave.endsWith(`-${provaId}`))
      .map(([chave, valor]) => {
        const [alunoId] = chave.split("-");
        return { Id_Aluno: Number(alunoId), Id_Prova: provaId, Valor: valor };
      });
    console.log("Salvando notas:", notasProva);
    // Aqui você pode chamar a API real
    // fetch("/notas", { method: "POST", body: JSON.stringify(notasProva) })
  };

  const excluirProva = (id: number) => {
    setProvas(prev => prev.filter(p => p.id !== id));
    console.log("Excluir prova:", id);
    // Aqui você pode chamar fetchDeletarProva(id)
  };

  return (
    <div>
      <Navbar usuario={usuario} />
      <Box sx={{ width: "70%", margin: "20px auto", marginLeft:'320px' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Provas da turma {turma.Nome}
        </Typography>

        {Object.entries(provasPorBimestre).map(([bimestre, provasBimestre]) => (
          <Box key={bimestre} sx={{ mb: 3 }}>
            <Typography variant="h6">Bimestre {bimestre}</Typography>
            {provasBimestre.map(p => (
              <Accordion key={p.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ flexGrow: 1 }}>{p.titulo}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <IconButton color="error" size="small" onClick={() => excluirProva(p.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {p.descricao}
                  </Typography>

                  {turma.alunos && turma.alunos.length > 0 ? (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Aluno</TableCell>
                          <TableCell>Nota ({p.disciplina})</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {turma.alunos.map(aluno => {
                          const chave = `${aluno.Id}-${p.id}`;
                          return (
                            <TableRow key={chave}>
                              <TableCell>{aluno.Nome}</TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={notas[chave] ?? ""}
                                  onChange={e =>
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
            ))}
          </Box>
        ))}
      </Box>
    </div>
  );
}
