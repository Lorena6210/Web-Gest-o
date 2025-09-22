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
    <Box sx={{ p: 4 }}>
      <Navbar usuario={usuario} />

      <Typography variant="h4" sx={{ mb: 2 }}>
        Bem-vindo, {usuario.Nome}
      </Typography>

      <Typography variant="h5" sx={{ mt: 2 }}>Turmas vinculadas</Typography>
      {turmas.length === 0 ? (
        <Typography>Nenhuma turma encontrada.</Typography>
      ) : (
        turmas.map((turma) => (
          <Box key={turma.Id} sx={{ border: "1px solid #ccc", p: 2, my: 2, borderRadius: 2 }}>
            <Typography variant="h6">{turma.Nome}</Typography>
            <Button
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={fetchAlunosDoResponsavel}
            >
              Ver Alunos
            </Button>
          </Box>
        ))
      )}

      {loadingAlunos && <CircularProgress sx={{ mt: 2 }} />}
      
      {alunos.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Alunos</Typography>
          {alunos.map((aluno) => (
            <Box key={aluno.Id} sx={{ border: "1px solid #aaa", p: 2, my: 2, borderRadius: 2 }}>
              <Typography variant="h6">{aluno.Nome}</Typography>
              <Typography>RA: {aluno.RA}</Typography>
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={() => fetchEventosDoAluno(aluno.Id)}
              >
                Ver Eventos
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {loadingEventos && <CircularProgress sx={{ mt: 2 }} />}

      {eventos.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Eventos</Typography>
          {eventos.map((ev) => (
            <Box
              key={ev.Id}
              sx={{
                border: "1px solid #666",
                p: 2,
                my: 2,
                borderRadius: 2,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Typography variant="h6">{ev.Titulo}</Typography>
              <Typography>{ev.Descricao}</Typography>
              <Typography>Data: {new Date(ev.Data).toLocaleDateString("pt-BR")}</Typography>
              <Typography>Criado por: {ev.CriadoPor}</Typography>
            </Box>
          ))}
        </Box>
      )}

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
