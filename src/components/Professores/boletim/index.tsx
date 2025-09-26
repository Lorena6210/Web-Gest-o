import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Boletim } from "@/lib/BoletimApi";
import { LineChart } from "@mui/x-charts";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

export interface Disciplina {
  Id: number;
  Nome: string;
  turmaId?: number;
  alunos?: Aluno[];
}

export interface Aluno {
  Id: number;
  Nome: string;
}

interface Falta {
  Id: number;
  Id_Aluno: number;
  Id_Disciplina: number;
  DataFalta: string;
  Justificada: number;
}

interface Props {
  usuario: Usuario;
  turmas?: TurmaCompleta[];
  boletim?: Boletim[];
  faltas?: Falta[];
}

export default function ProfessorBoletimPage({
  usuario,
  turmas = [],
  boletim = [],
  faltas = [],
}: Props) {
  const [notasEditadas, setNotasEditadas] = useState<Record<string, Partial<Boletim>>>({});
  const [graficoAberto, setGraficoAberto] = useState(false);
  const [graficoData, setGraficoData] = useState<{ x: string; y: number }[]>([]);
  const [graficoTitulo, setGraficoTitulo] = useState("");

  useEffect(() => {
    console.log("Dados Boletim:", boletim);
    console.log("Dados Faltas:", faltas);
  }, [boletim, faltas]);

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
    // TODO: chamada API para salvar
  };

  const turmasDoProfessor = turmas.filter((t) =>
    t.professores?.some((p) => p.Id === usuario.Id)
  );

  const disciplinasDoProfessor = turmasDoProfessor.flatMap((t) =>
    (t.disciplinas || []).map((d) => ({
      ...d,
      turmaId: t.Id,
      alunos: t.alunos || [],
    }))
  );

  const abrirGrafico = (aluno: Aluno, disciplinaId: number) => {
    const faltasDoAluno = (faltas || []).filter(
      (f) => f.Id_Aluno === aluno.Id && f.Id_Disciplina === disciplinaId
    );
    // Criar dados para gráfico: por data, número de faltas em cada data
    // Se houver múltiplas faltas na mesma data, agregue
    const mapa: Record<string, number> = {};
    faltasDoAluno.forEach((f) => {
      const dataStr = new Date(f.DataFalta).toLocaleDateString();
      mapa[dataStr] = (mapa[dataStr] ?? 0) + 1;
    });
    const dados = Object.entries(mapa).map(([dataStr, cont]) => ({
      x: dataStr,
      y: cont,
    }));
    setGraficoData(dados);
    setGraficoTitulo(`Faltas de ${aluno.Nome}`);
    setGraficoAberto(true);
  };

  const handleFecharGrafico = () => {
    setGraficoAberto(false);
  };

  return (
    <div>
      <Navbar usuario={usuario} />
      <Box
        sx={{
          marginLeft: "320px",
          width: "74%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 4,
          px: 2,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Boletim
        </Typography>

        {disciplinasDoProfessor.length === 0 ? (
          <Typography color="error">Nenhuma disciplina atribuída a você.</Typography>
        ) : (
          <Paper elevation={3} sx={{ width: "100%", p: 2 }}>
            {disciplinasDoProfessor.map((disciplina) => (
              <Accordion
                key={`${disciplina.Id}-${disciplina.turmaId}`}
                sx={{ width: "100%", mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight="bold">
                    {disciplina.Nome}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper
                    elevation={2}
                    sx={{ width: "100%", overflowX: "auto", borderRadius: 2 }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#1976d2" }}>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Aluno</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Bimestre</TableCell>
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
                        {(disciplina.alunos || []).length > 0 ? (
                          disciplina.alunos!.map((aluno) => {
                            const notasAluno = (boletim || []).filter(
                              (n) =>
                                n.Id_Aluno === aluno.Id &&
                                n.Id_Disciplina === disciplina.Id
                            );
                            return notasAluno.length > 0 ? (
                              notasAluno.map((nota) => {
                                const chave = `${nota.Id_Aluno}-${nota.Id_Disciplina}-${nota.Id_Bimestre}`;
                                const editado = notasEditadas[chave] || {};
                                // Transformar valores para exibição
                                const mediaAtiv = nota.MediaAtividades
                                  ? parseFloat(nota.MediaAtividades).toFixed(2)
                                  : "0.00";
                                const mediaProv = nota.MediaProvas
                                  ? parseFloat(nota.MediaProvas).toFixed(2)
                                  : "0.00";
                                const mediaFinalStr = nota.MediaFinal
                                  ? parseFloat(nota.MediaFinal).toFixed(2)
                                  : "0.00";
                                const frequenciaStr = nota.Frequencia != null
                                  ? `${nota.Frequencia}%`
                                  : "0%";

                                return (
                                  <TableRow key={chave} hover>
                                    <TableCell>{aluno.Nome}</TableCell>
                                    <TableCell>{nota.Id_Bimestre}º</TableCell>
                                    <TableCell>{mediaAtiv}</TableCell>
                                    <TableCell>{mediaProv}</TableCell>
                                    <TableCell>
                                      {/* Aqui mostra a Média Final, permitir edição se quiser */}
                                      <TextField
                                        type="number"
                                        size="small"
                                        value={
                                          editado.MediaFinal ??
                                          mediaFinalStr
                                        }
                                        onChange={(e) =>
                                          handleChange(
                                            chave,
                                            "MediaFinal",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {/* Coluna frequência clicável para abrir gráfico */}
                                      <Button
                                        variant="text"
                                        size="small"
                                        onClick={() =>
                                          abrirGrafico(aluno, disciplina.Id)
                                        }
                                      >
                                        {frequenciaStr}
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        size="small"
                                        value={editado.Situacao ?? nota.Situacao ?? ""}
                                        onChange={(e) =>
                                          handleChange(
                                            chave,
                                            "Situacao",
                                            e.target.value
                                          )
                                        }
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
                                        onChange={(e) =>
                                          handleChange(
                                            chave,
                                            "Observacoes",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleSalvar(chave)}
                                      >
                                        Salvar
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow key={`novo-${aluno.Id}`} hover>
                                <TableCell>{aluno.Nome}</TableCell>
                                <TableCell colSpan={8} align="center">
                                  <Button variant="outlined" color="success" size="small">
                                    Adicionar Nota
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              Nenhum aluno nesta disciplina.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        )}
      </Box>

      <Dialog open={graficoAberto} onClose={handleFecharGrafico} maxWidth="sm" fullWidth>
        <DialogTitle>{graficoTitulo}</DialogTitle>
        <DialogContent>
          <LineChart
            series={[
              {
                data: graficoData.map((pt) => pt.y),
              },
            ]}
            xAxis={[
              {
                data: graficoData.map((pt) => pt.x),
                scaleType: "point",
              },
            ]}
            height={300}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
