"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Navbar from "./Navbar";

interface Responsavel {
  Id: number;
  Nome: string;
  Email?: string;
  Telefone?: string;
  Parentesco?: string;
}

interface Aluno {
  Id: number;
  Nome: string;
  RA?: string;
  Id_Responsavel: number;
}

interface Evento {
  Id: number;
  Titulo: string;
  Descricao: string;
  Data: string;
  Id_Aluno: number;
  CriadoPor: string;
}

interface Props {
  usuario: {
    Nome: string;
    Id: number;
    Tipo: string;
  };
  turmas: {
    Id: number;
    Nome: string;
    alunos?: Aluno[];
    // outros campos que TurmaCompleta tiver
  }[];
}

const Alert = React.forwardRef<HTMLDivElement, { severity: AlertColor; children: React.ReactNode }>(
  (props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" severity={props.severity}>{props.children}</MuiAlert>
);

export default function ResponsavelPageComponent({ usuario, turmas }: Props) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [loadingEventos, setLoadingEventos] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Função para carregar alunos do responsável
  const fetchAlunosDoResponsavel = async () => {
    try {
      setLoadingAlunos(true);
      const res = await fetch(`http://localhost:3001/alunos?Id_Responsavel=${usuario.Id}`);
      if (!res.ok) throw new Error("Erro ao carregar alunos");
      const data: Aluno[] = await res.json();
      setAlunos(data);
      setEventos([]); // limpa eventos anteriores
    } catch (err) {
      console.error("Erro ao buscar alunos do responsável:", err);
      showSnackbar("Erro ao carregar alunos", "error");
    } finally {
      setLoadingAlunos(false);
    }
  };

  // Função para carregar eventos de um aluno específico
  const fetchEventosDoAluno = async (idAluno: number) => {
    try {
      setLoadingEventos(true);
      const res = await fetch(`http://localhost:3001/eventos?Id_Aluno=${idAluno}`);
      if (!res.ok) throw new Error("Erro ao carregar eventos");
      const data: Evento[] = await res.json();
      setEventos(data);
    } catch (err) {
      console.error("Erro ao buscar eventos do aluno:", err);
      showSnackbar("Erro ao carregar eventos", "error");
    } finally {
      setLoadingEventos(false);
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f3f4f6", minHeight: "100vh" }}>
      <Navbar usuario={usuario} />

      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "#4f46e5", textAlign: "center" }}>
        Bem-vindo, {usuario.Nome}
      </Typography>

      {/* Turmas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#1e40af" }}>
          Turmas vinculadas
        </Typography>
        {turmas.length === 0 ? (
          <Typography sx={{ color: "#6b7280" }}>Nenhuma turma encontrada.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {turmas.map((turma) => (
              <Box
                key={turma.Id}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {turma.Nome}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
                  onClick={fetchAlunosDoResponsavel}
                >
                  Ver Alunos
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Alunos */}
      {alunos.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#1e40af" }}>Alunos</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {alunos.map((aluno) => (
              <Box
                key={aluno.Id}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  boxShadow: 2,
                  transition: "all 0.2s",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 6 },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{aluno.Nome}</Typography>
                <Typography sx={{ color: "#6b7280" }}>RA: {aluno.RA || "Não informado"}</Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
                  onClick={() => fetchEventosDoAluno(aluno.Id)}
                >
                  Ver Eventos
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Eventos */}
      {eventos.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#1e40af" }}>Eventos</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {eventos.map((ev) => (
              <Box
                key={ev.Id}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#f9fafb",
                  boxShadow: 1,
                  transition: "all 0.2s",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#4f46e5" }}>
                  {ev.Titulo}
                </Typography>
                <Typography sx={{ mb: 1 }}>{ev.Descricao}</Typography>
                <Typography sx={{ color: "#6b7280" }}>Data: {new Date(ev.Data).toLocaleDateString("pt-BR")}</Typography>
                <Typography sx={{ color: "#6b7280" }}>Criado por: {ev.CriadoPor}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Loading */}
      {(loadingAlunos || loadingEventos) && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
