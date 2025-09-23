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
  Select
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Boletim } from "@/lib/BoletimApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

export interface Disciplina {
  Id: number;
  Nome: string;
  Codigo?: string;
  CargaHoraria?: number;
  ProfessorId?: number;
  turmaId?: number;
  alunos?: Aluno[];
}

export interface Aluno {
  Id: number;
  Nome: string;
  RA?: string;
  FotoPerfil?: string | null;
}

interface Props {
  usuario: Usuario;
  turmas?: TurmaCompleta[];
  boletim: Boletim[];
}

export default function ProfessorBoletimPage({ usuario, turmas = [], boletim }: Props) {
  const [notasEditadas, setNotasEditadas] = useState<Record<string, Partial<Boletim>>>({});

  // Debug: Logs para conferir dados
  useEffect(() => {
    console.log("Usuário:", usuario);
    console.log("Turmas:", turmas);
    console.log("Boletim:", boletim);
  }, [usuario, turmas, boletim]);

  // Atualiza um campo específico da nota editada
  const handleChange = (chave: string, campo: keyof Boletim, valor: string) => {
    setNotasEditadas((prev) => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor
      }
    }));
  };

  // Salvar edição (aqui você conecta à API)
  const handleSalvar = (chave: string) => {
    const dados = notasEditadas[chave];
    console.log("Salvando nota:", chave, dados);
    // TODO: implementar chamada API para salvar notas editadas
  };

  // Filtra as turmas do professor logado
  const turmasDoProfessor = turmas.filter(t =>
    t.professores?.some(p => p.Id === usuario.Id)
  );

  // Extrai disciplinas do professor dentro dessas turmas, anexando alunos e turmaId
  const disciplinasDoProfessor = turmasDoProfessor.flatMap(t =>
    (t.disciplinas || []).map(d => ({
      ...d,
      turmaId: t.Id,
      alunos: t.alunos || []
    }))
  );

  return (
    <div>
      <Navbar usuario={usuario} />
      <Box sx={{marginLeft: "320px", width: "74%", display: "flex", flexDirection: "column", alignItems: "center", mt: 4, px: 2 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Boletim
        </Typography>

        {disciplinasDoProfessor.length === 0 ? (
          <Typography color="error">Nenhuma disciplina atribuída a você.</Typography>
        ) : (
          <Paper elevation={3} sx={{ width: "100%", p: 2 }}>
            {disciplinasDoProfessor.map((disciplina) => (
              <Accordion key={`${disciplina.Id}-${disciplina.turmaId}`} sx={{ width: "100%", mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight="bold">{disciplina.Nome}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper elevation={2} sx={{ width: "100%", overflowX: "auto", borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#1976d2" }}>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Aluno</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Bimestre</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Média Atividades</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Média Provas</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Média Final</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Situação</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observações</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {disciplina.alunos && disciplina.alunos.length > 0 ? (
                          disciplina.alunos.map((aluno) => {
                            // Filtra as notas do boletim para este aluno e disciplina
                            const notasAluno = boletim.filter(
                              (n) => n.Id_Aluno === aluno.Id && n.Id_Disciplina === disciplina.Id
                            );

                            // Se existir notas, exibe elas (por bimestre)
                            return notasAluno.length > 0 ? (
                              notasAluno.map((nota) => {
                                const chave = `${nota.Id_Aluno}-${nota.Id_Disciplina}-${nota.Id_Bimestre}`;
                                const editado = notasEditadas[chave] || {};
                                return (
                                  <TableRow key={chave} hover>
                                    <TableCell>{aluno.Nome}</TableCell>
                                    <TableCell>{nota.Id_Bimestre}º</TableCell>
                                    <TableCell>{parseFloat(nota.MediaAtividades).toFixed(2)}</TableCell>
                                    <TableCell>{parseFloat(nota.MediaProvas).toFixed(2)}</TableCell>
                                    <TableCell>
                                      <TextField
                                        type="number"
                                        size="small"
                                        value={editado.MediaFinalCalculada ?? parseFloat(nota.MediaFinalCalculada).toFixed(2)}
                                        onChange={(e) => handleChange(chave, "MediaFinalCalculada", e.target.value)}
                                      />
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
                                      <Button variant="contained" color="primary" size="small" onClick={() => handleSalvar(chave)}>Salvar</Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              // Caso não tenha notas ainda para o aluno e disciplina, dá opção para adicionar
                              <TableRow key={`novo-${aluno.Id}`} hover>
                                <TableCell>{aluno.Nome}</TableCell>
                                <TableCell colSpan={7} align="center">
                                  <Button variant="outlined" color="success" size="small">Adicionar Nota</Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} align="center">Nenhum aluno nesta disciplina.</TableCell>
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
    </div>
  );
}
