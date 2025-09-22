// components/Professores/ProfessorPage.tsx
import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { Prova, NotaProva } from "@/lib/provaApi";
import { TurmaCompleta } from "@/Types/Turma";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provasPorTurma: Record<number, Prova[]>;
  notasProvas: NotaProva[];
}

export default function ProfessorPageComponent({
  usuario,
  turmas,
  provasPorTurma,
  notasProvas,
}: Props) {
  // Você pode permitir selecionar uma turma para exibir; por simplicidade vou pegar a primeira
  const turmaSelecionada = turmas[0];

  const provas = turmaSelecionada
    ? provasPorTurma[turmaSelecionada.Id] || []
    : [];

  // Estado local de notas para inputs
  const [notas, setNotas] = useState<Record<string, number>>({});

  useEffect(() => {
    // Inicializar o estado com notas vindas das props
    const map: Record<string, number> = {};
    notasProvas.forEach(n => {
      const chave = `${n.Id_Aluno}-${n.Id_Prova}`;
      map[chave] = n.Valor;
    });
    setNotas(map);
  }, [notasProvas]);

  const handleNotaChange = (alunoId: number, provaId: number, valor: string) => {
    const chave = `${alunoId}-${provaId}`;
    setNotas(prev => ({
      ...prev,
      [chave]: parseFloat(valor),
    }));
  };

  const salvarNotas = (provaId: number) => {
    const notasProva = Object.entries(notas)
      .filter(([chave]) => chave.endsWith(`-${provaId}`))
      .map(([chave, valor]) => {
        const [alunoId] = chave.split("-");
        return {
          Id_Aluno: Number(alunoId),
          Id_Prova: provaId,
          Valor: valor,
        };
      });
    console.log("Salvando notas da prova", provaId, notasProva);
    // Aqui você chamaria fetch de salvar notas
  };

  const excluirProva = (provaId: number) => {
    console.log("Excluir prova:", provaId);
    // chamar fetchDeletarProva(provaId) etc
  };

  return (
    <div>
      <Navbar usuario={usuario} />
      <Box sx={{ width: "70%", margin: "20px auto", marginLeft: "320px" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {turmaSelecionada
            ? `Provas da turma ${turmaSelecionada.Nome}`
            : "Nenhuma turma selecionada"}
        </Typography>

        {provas.length === 0 && (
          <Typography>Nenhuma prova para essa turma.</Typography>
        )}

        {provas.map(p => (
          <Box key={p.id} sx={{ mb: 3 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ flexGrow: 1 }}>
                  {p.titulo}{" "}
                  {p.dataEntrega ? `- entrega: ${p.dataEntrega}` : ""}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => excluirProva(p.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {p.descricao && (
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {p.descricao}
                  </Typography>
                )}

                {turmaSelecionada.alunos && turmaSelecionada.alunos.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Aluno</TableCell>
                        <TableCell>Nota</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {turmaSelecionada.alunos.map(aluno => {
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
                  <Typography>Nenhum aluno nessa turma</Typography>
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
          </Box>
        ))}
      </Box>
    </div>
  );
}
