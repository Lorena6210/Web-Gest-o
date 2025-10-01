import React, { useState } from "react";
import Navbar from "../Navbar";
import { TurmaCompleta } from "@/Types/Turma";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  MenuItem,
  Select,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Boletim } from "@/lib/BoletimApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

export interface Aluno {
  Id: number;
  Nome: string;
}

export interface Disciplina {
  Id: number;
  Nome: string;
  NomeDisciplina:string
}

interface Props {
  usuario: Usuario;
  turmas?: TurmaCompleta[];
  boletim?: Boletim[];
}

export default function ProfessorBoletimPage({
  usuario,
  turmas = [],
  boletim = [],
}: Props) {
  const [notasEditadas, setNotasEditadas] = useState<Record<string, Partial<Boletim>>>({});

  // Filtrar turmas do professor
  const turmasDoProfessor = turmas.filter((t) =>
    t.professores?.some((p) => p.Id === usuario.Id)
  );

  const handleChange = (chave: string, campo: keyof Boletim, valor: string) => {
    setNotasEditadas((prev) => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor,
      },
    }));
  };

  const handleSalvar = (chave: string) => {
    const dados = notasEditadas[chave];
    console.log("Salvando nota:", chave, dados);
    // TODO: chamada API
  };

  return (
    <div>
      <Navbar usuario={usuario} />
      <Box sx={{ marginLeft: "320px", width: "74%", mt: 4, px: 2 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Boletim por Turma, Bimestre e Disciplina
        </Typography>

        {turmasDoProfessor.map((turma) => {
          // Agrupar boletim por bimestre dentro da turma
          const bimestresMap: Record<number, Boletim[]> = {};
          boletim
            .filter((b) => turma.alunos?.some((a) => a.Id === b.Id_Aluno))
            .forEach((b) => {
              if (!bimestresMap[b.Id_Bimestre]) bimestresMap[b.Id_Bimestre] = [];
              bimestresMap[b.Id_Bimestre].push(b);
            });

          return (
            <Paper key={turma.Id} sx={{ mb: 4, p: 2 }}>
              <Typography variant="h6">
                {`Turma: ${turma.Nome} / Ano: ${turma.Serie}`}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {Object.entries(bimestresMap)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([bimestreStr, boletinsDoBimestre]) => {
                  const bimestreNum = Number(bimestreStr);

                  // Agrupar por disciplina
                  const disciplinasMap: Record<string, Boletim[]> = {};
                  boletinsDoBimestre.forEach((b) => {
                    if (!disciplinasMap[b.disciplina]) disciplinasMap[b.disciplina] = [];
                    disciplinasMap[b.disciplina].push(b);
                  });

                  return (
                    <Paper key={bimestreNum} sx={{ mb: 3, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {bimestreNum}º Bimestre
                      </Typography>
                      <Divider sx={{ my: 1 }} />

                      {Object.entries(disciplinasMap).map(([nomeDisciplina, notasDisciplina]) => (
                        <Accordion key={nomeDisciplina} sx={{ mb: 2 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {nomeDisciplina} {/* Nome da disciplina dentro do bimestre */}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: "#1976d2" }}>
                                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Aluno</TableCell>
                                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Média Atividades</TableCell>
                                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Média Provas</TableCell>
                                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Média Final</TableCell>
                                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Frequência</TableCell>
                                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Situação</TableCell>
                                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observações</TableCell>
                                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ações</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {notasDisciplina.map((nota) => {
                                  const aluno = turma.alunos?.find((a) => a.Id === nota.Id_Aluno);
                                  if (!aluno) return null;
                                  const chave = `${nota.Id_Aluno}-${nota.Id_Disciplina}-${nota.Id_Bimestre}`;
                                  const editado = notasEditadas[chave] || {};

                                  return (
                                    <TableRow key={chave} hover>
                                      <TableCell>{aluno.Nome}</TableCell>
                                      <TableCell>{parseFloat(nota.MediaAtividades || "0").toFixed(2)}</TableCell>
                                      <TableCell>{parseFloat(nota.MediaProvas || "0").toFixed(2)}</TableCell>
                                      <TableCell>
                                        <TextField
                                          type="number"
                                          size="small"
                                          value={editado.MediaFinal ?? parseFloat(nota.MediaFinal || "0").toFixed(2)}
                                          onChange={(e) => handleChange(chave, "MediaFinal", e.target.value)}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {nota.Frequencia === 0 ? "100%" : `${Math.max(0, 100 - nota.Frequencia * 1)}%`}
                                      </TableCell>
                                      <TableCell>
                                        <Select
                                          size="small"
                                          value={editado.Situacao ?? nota.Situacao ?? ""}
                                          onChange={(e) => handleChange(chave, "Situacao", e.target.value)}
                                        >
                                          <MenuItem value="">Não definida</MenuItem>
                                          <MenuItem value="Aprovado">Aprovado</MenuItem>
                                          <MenuItem value="Reprovado">Reprovado</MenuItem>
                                          <MenuItem value="Recuperação">Recuperação</MenuItem>
                                        </Select>
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          size="small"
                                          value={editado.Observacoes ?? nota.Observacoes ?? ""}
                                          onChange={(e) => handleChange(chave, "Observacoes", e.target.value)}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Button size="small" variant="contained" onClick={() => handleSalvar(chave)}>
                                          Salvar
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Paper>
                  );
                })}
            </Paper>
          );
        })}
      </Box>
    </div>
  );
}
