"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  Select,
  MenuItem,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import  Navbar  from "../Navbar";
import { Usuario } from '../../../lib/jwtLoginStatus';

interface Responsavel {
  Id: number;
  Nome: string;
}

interface Evento {
  Id: number;
  Titulo: string;
  Descricao: string;
  Data: string;
  Responsavel: string; // vem do JOIN no backend
  CriadoPor: string;
}

interface Props {
  usuario: Usuario
}

export default function GestorEventosPage({ usuario }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<number | null>(null);

  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Buscar responsáveis
  useEffect(() => {
    const fetchResponsaveis = async () => {
      try {
        const res = await fetch("http://localhost:3001/responsaveis");
        const data = await res.json();
        setResponsaveis(data);
      } catch (err) {
        console.error(err);
        showSnackbar("Erro ao carregar responsáveis", "error");
      }
    };
    fetchResponsaveis();
  }, []);

  // Buscar eventos
  const fetchEventos = async () => {
    try {
      const res = await fetch("http://localhost:3001/eventos");
      if (!res.ok) throw new Error("Erro ao buscar eventos");
      const data = await res.json();
      setEventos(data);
    } catch (err) {
      console.error(err);
      showSnackbar("Erro ao buscar eventos", "error");
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleCriarEvento = async () => {
    if (!responsavelSelecionado) {
      showSnackbar("Selecione um responsável", "warning");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Titulo: titulo,
          Descricao: descricao,
          Data: data,
          Id_Responsavel: responsavelSelecionado,
          CriadoPor: "Gestor",
        }),
      });
      if (!res.ok) throw new Error("Erro ao criar evento");
      showSnackbar("Evento criado com sucesso!", "success");
      setTitulo("");
      setDescricao("");
      setData("");
      setResponsavelSelecionado(null);
      fetchEventos(); // atualiza lista após criar
    } catch (err) {
      console.error(err);
      showSnackbar("Erro ao criar evento", "error");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Navbar usuario={usuario} />
      <Typography variant="h4" gutterBottom style={{display: "flex", justifyContent: "center"}}>
        Criar Evento
      </Typography>

    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", maxWidth:"1024PX", position: "relative", left: "20%"}}>
      <Input
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        sx={{ display: "block", my: 2 }}
      />
      <Input
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        sx={{ display: "block", my: 2 }}
      />
      <Input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        sx={{ display: "block", my: 2 }}
      />

      <Select
        value={responsavelSelecionado || ""}
        onChange={(e) => setResponsavelSelecionado(Number(e.target.value))}
        displayEmpty
        sx={{ display: "block", my: 2, minWidth: 200 }}
      >
        <MenuItem value="">Selecione um responsável</MenuItem>
        {responsaveis.map((resp) => (
          <MenuItem key={resp.Id} value={resp.Id}>
            {resp.Nome}
          </MenuItem>
        ))}
      </Select>

      <Button variant="contained" onClick={handleCriarEvento} sx={{ mb: 4 }}>
        Criar Evento
      </Button>

      <Typography variant="h5" gutterBottom>
        Lista de Eventos
      </Typography>

      <Paper sx={{ maxHeight: 300, overflow: "auto", p: 2 }}>
        <List>
          {eventos.map((evento) => (
            <ListItem key={evento.Id} divider>
              <ListItemText
                primary={`${evento.Titulo} - ${evento.Data}`}
                secondary={`${evento.Descricao} | Responsável: ${evento.Responsavel} | Criado por: ${evento.CriadoPor}`}
              />
            </ListItem>
          ))}
          {eventos.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhum evento encontrado.
            </Typography>
          )}
        </List>
      </Paper>

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
    </Box>
  );
}
