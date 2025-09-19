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

interface Responsavel {
  Id: number;
  Nome: string;
  Email: string;
  Telefone: string;
  Parentesco: string;
}

interface Aluno {
  Id: number;
  Nome: string;
  RA: string;
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

export default function ResponsavelPage() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 🔹 Carrega responsáveis
  useEffect(() => {
    const fetchResponsaveis = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/responsaveis");
        if (!res.ok) throw new Error("Erro ao carregar responsáveis");
        const data: Responsavel[] = await res.json();
        setResponsaveis(data);
      } catch (err) {
        console.error(err);
        showSnackbar("Erro ao carregar responsáveis", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchResponsaveis();
  }, []);

  // 🔹 Carrega alunos do responsável
  const handleVerAlunos = async (idResponsavel: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/responsaveis/${idResponsavel}/alunos`
      );
      if (!res.ok) throw new Error("Erro ao carregar alunos");
      const data: Aluno[] = await res.json();
      setAlunos(data);
      setEventos([]);
    } catch (err) {
      console.error(err);
      showSnackbar("Erro ao carregar alunos", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Carrega eventos de um aluno
  const handleVerEventos = async (idAluno: number) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/eventos?Id_Aluno=${idAluno}`);
      if (!res.ok) throw new Error("Erro ao carregar eventos");
      const data: Evento[] = await res.json();
      setEventos(data);
    } catch (err) {
      console.error(err);
      showSnackbar("Erro ao carregar eventos", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Responsáveis</Typography>

      {loading && <CircularProgress sx={{ mt: 2 }} />}

      {/* Lista de Responsáveis */}
      {responsaveis.map((resp) => (
        <Box
          key={resp.Id}
          sx={{ border: "1px solid #ccc", p: 2, my: 2, borderRadius: 2 }}
        >
          <Typography variant="h6">{resp.Nome}</Typography>
          <Typography>Email: {resp.Email}</Typography>
          <Typography>Telefone: {resp.Telefone}</Typography>
          <Typography>Parentesco: {resp.Parentesco}</Typography>
          <Button
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => handleVerAlunos(resp.Id)}
          >
            Ver Alunos
          </Button>
        </Box>
      ))}

      {/* Lista de Alunos */}
      {alunos.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Alunos</Typography>
          {alunos.map((aluno) => (
            <Box
              key={aluno.Id}
              sx={{ border: "1px solid #aaa", p: 2, my: 2, borderRadius: 2 }}
            >
              <Typography variant="h6">{aluno.Nome}</Typography>
              <Typography>RA: {aluno.RA}</Typography>
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={() => handleVerEventos(aluno.Id)}
              >
                Ver Eventos
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {/* Lista de Eventos */}
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
              <Typography>
                Data: {new Date(ev.Data).toLocaleDateString("pt-BR")}
              </Typography>
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
        <MuiAlert severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
