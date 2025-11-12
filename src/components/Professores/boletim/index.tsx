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
<Box>
  <Navbar usuario={usuario} />

  <Box sx={{ ml: "320px", width: "74%", mt: 4, px: 2, fontFamily: "Arial, sans-serif" }}>
    <Typography
      variant="h4"
      sx={{ mb: 4, fontWeight: "bold", color: "#4f46e5", textAlign: "center" }}
    >
      Boletim por Turma, Bimestre e Disciplina
    </Typography>

    {turmasDoProfessor.map((turma) => {
      const bimestresMap: Record<number, Boletim[]> = {};
      boletim
        .filter((b) => turma.alunos?.some((a) => a.Id === b.Id_Aluno))
        .forEach((b) => {
          if (!bimestresMap[b.Id_Bimestre]) bimestresMap[b.Id_Bimestre] = [];
          bimestresMap[b.Id_Bimestre].push(b);
        });

      return (
        <Paper
          key={turma.Id}
          sx={{
            mb: 5,
            p: 3,
            borderRadius: 3,
            boxShadow: 5,
            bgcolor: "#ffffff",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": { transform: "translateY(-2px)", boxShadow: 8 },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1e40af" }}
            >
              {`Turma: ${turma.Nome} / Ano: ${turma.Serie}`}
            </Typography>

            {/* Botão para adicionar Bimestre */}
            <Button
              variant="contained"
              sx={{
                bgcolor: "#4f46e5",
                "&:hover": { bgcolor: "#4338ca" },
                textTransform: "none",
              }}
              onClick={() => alert(`Adicionar Bimestre na turma ${turma.Nome}`)}
            >
              + Adicionar Bimestre
            </Button>
          </Box>

          <Divider sx={{ borderColor: "#e5e7eb", mb: 3 }} />

          {Object.entries(bimestresMap)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([bimestreStr, boletinsDoBimestre]) => {
              const bimestreNum = Number(bimestreStr);

              const disciplinasMap: Record<string, Boletim[]> = {};
              boletinsDoBimestre.forEach((b) => {
                if (!disciplinasMap[b.disciplina]) disciplinasMap[b.disciplina] = [];
                disciplinasMap[b.disciplina].push(b);
              });

              return (
                <Paper
                  key={bimestreNum}
                  sx={{
                    mb: 4,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#f9fafb",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ color: "#1e3a8a", mb: 1 }}
                  >
                    {bimestreNum}º Bimestre
                  </Typography>
                  <Divider sx={{ my: 1, borderColor: "#cbd5e1" }} />

                  {Object.entries(disciplinasMap).map(
                    ([nomeDisciplina, notasDisciplina]) => (
                      <Accordion
                        key={nomeDisciplina}
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          "&:before": { display: "none" },
                          boxShadow: 1,
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            sx={{ color: "#2563eb" }}
                          >
                            {nomeDisciplina}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Table size="small" sx={{ borderRadius: 2 }}>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: "#2563eb" }}>
                                {[
                                  "Aluno",
                                  "Média Atividades",
                                  "Média Provas",
                                  "Média Final",
                                  "Frequência",
                                  "Situação",
                                  "Observações",
                                  "Ações",
                                ].map((col) => (
                                  <TableCell
                                    key={col}
                                    sx={{
                                      color: "#ffffff",
                                      fontWeight: "bold",
                                      textAlign: "center",
                                    }}
                                  >
                                    {col}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {notasDisciplina.map((nota) => {
                                const aluno = turma.alunos?.find(
                                  (a) => a.Id === nota.Id_Aluno
                                );
                                if (!aluno) return null;
                                const chave = `${nota.Id_Aluno}-${nota.Id_Disciplina}-${nota.Id_Bimestre}`;
                                const editado = notasEditadas[chave] || {};

                                return (
                                  <TableRow
                                    key={chave}
                                    hover
                                    sx={{
                                      "&:hover": { backgroundColor: "#e0f2fe" },
                                    }}
                                  >
                                    <TableCell>{aluno.Nome}</TableCell>
                                    <TableCell>
                                      {parseFloat(
                                        nota.MediaAtividades || "0"
                                      ).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      {parseFloat(nota.MediaProvas || "0").toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        type="number"
                                        size="small"
                                        value={
                                          editado.MediaFinal ??
                                          parseFloat(nota.MediaFinal || "0").toFixed(2)
                                        }
                                        onChange={(e) =>
                                          handleChange(chave, "MediaFinal", e.target.value)
                                        }
                                        sx={{ width: "80px" }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {nota.Frequencia === 0
                                        ? "100%"
                                        : `${Math.max(
                                            0,
                                            100 - nota.Frequencia * 1
                                          )}%`}
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        size="small"
                                        value={editado.Situacao ?? nota.Situacao ?? ""}
                                        onChange={(e) =>
                                          handleChange(chave, "Situacao", e.target.value)
                                        }
                                        sx={{ width: "120px" }}
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
                                          handleChange(chave, "Observacoes", e.target.value)
                                        }
                                        sx={{ width: "150px" }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        sx={{
                                          bgcolor: "#4f46e5",
                                          "&:hover": { bgcolor: "#4338ca" },
                                        }}
                                        onClick={() => handleSalvar(chave)}
                                      >
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
                    )
                  )}
                </Paper>
              );
            })}
        </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
