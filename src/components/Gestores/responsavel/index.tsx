"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Navbar from "../Navbar";
import { FaPlus, FaEnvelope, FaPhone, FaUser } from "react-icons/fa";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  id: number;
  usuario: Usuario;
}

interface Responsavel {
  Id: number;
  Nome: string;
  Email: string;
  Senha: string;
  Telefone: string;
  Endereco: string;
  DataNascimento: string;
  Genero: string;
  FotoPerfil: string | null;
  Parentesco: string;
  Status: string;
  CPF: string;
}

interface Aluno {
  Id: number;
  Nome: string;
  RA: string;
  Id_Responsavel: number;
}

export default function TodosResponsaveisPage({ usuario }: Props) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);

  const [openResponsavel, setOpenResponsavel] = useState(false);
  const [responsavelSelecionado, setResponsavelSelecionado] =
    useState<Responsavel | null>(null);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Busca todos os responsáveis
  useEffect(() => {
    const fetchResponsaveis = async () => {
      try {
        const res = await fetch("http://localhost:3001/responsaveis");
        if (!res.ok) throw new Error("Erro ao carregar responsáveis");
        const data: Responsavel[] = await res.json();
        setResponsaveis(data);
      } catch (error) {
        console.error(error);
        showSnackbar("Erro ao carregar responsáveis", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchResponsaveis();
  }, []);

  // Quando abre o modal, buscar os alunos desse responsável
  const handleOpenResponsavel = async (responsavel: Responsavel) => {
    setResponsavelSelecionado(responsavel);
    setOpenResponsavel(true);
    setLoadingAlunos(true);
    try {
      const res = await fetch(
        `http://localhost:3001/responsaveis/${responsavel.Id}/alunos`
      );
      if (!res.ok) throw new Error("Erro ao carregar alunos");
      const data: Aluno[] = await res.json();
      setAlunos(data);
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao carregar alunos", "error");
      setAlunos([]);
    } finally {
      setLoadingAlunos(false);
    }
  };


  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f9fafb" }}>
      <Navbar usuario={usuario} />
      <Box
        sx={{
          marginLeft: "320px",
          padding: "40px 20px",
          maxWidth: "1024px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#4f46e5" }}>
          Todos os Responsáveis
        </Typography>

        {loading ? (
          <Typography>Carregando responsáveis...</Typography>
        ) : responsaveis.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {responsaveis.map((r) => (
              <Box
                key={r.Id}
                onClick={() => handleOpenResponsavel(r)}
                sx={{
                  bgcolor: "#ffffff",
                  borderRadius: 2,
                  p: 2,
                  boxShadow: 2,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  opacity: r.Status === "Desativado" ? 0.5 : 1,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 6,
                  },
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                  <FaUser style={{ marginRight: 6 }} />
                  {r.Nome}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#4b5563" }}>
                  <FaEnvelope style={{ marginRight: 6 }} />
                  {r.Email || "Não informado"}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#4b5563" }}>
                  <FaPhone style={{ marginRight: 6 }} />
                  {r.Telefone || "Não informado"}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#4b5563" }}>
                  Parentesco: {r.Parentesco}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>Nenhum responsável encontrado.</Typography>
        )}

        {/* Modal do responsável */}
        <Modal open={openResponsavel} onClose={() => setOpenResponsavel(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "#ffffff",
              borderRadius: 2,
              p: 4,
              width: 500,
              maxWidth: "90%",
              boxShadow: 6,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {responsavelSelecionado && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {responsavelSelecionado.Nome}
                </Typography>
                <Typography>
                  <FaEnvelope style={{ marginRight: 6 }} />
                  {responsavelSelecionado.Email}
                </Typography>
                <Typography>
                  <FaPhone style={{ marginRight: 6 }} />
                  {responsavelSelecionado.Telefone}
                </Typography>
                <Typography>
                  <FaUser style={{ marginRight: 6 }} />
                  Parentesco: {responsavelSelecionado.Parentesco}
                </Typography>
                <Typography>CPF: {responsavelSelecionado.CPF}</Typography>
                <Typography>Status: {responsavelSelecionado.Status}</Typography>

                <Typography sx={{ mt: 2, fontWeight: "bold" }}>
                  Alunos vinculados:
                </Typography>
                {loadingAlunos ? (
                  <Typography>Carregando alunos...</Typography>
                ) : alunos.length > 0 ? (
                  <ul style={{ marginLeft: 20, color: "#374151" }}>
                    {alunos.map((aluno) => (
                      <li key={aluno.Id}>
                        {aluno.Nome} (RA: {aluno.RA})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography>Nenhum aluno vinculado.</Typography>
                )}
              </>
            )}
          </Box>
        </Modal>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            variant="filled"
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>

        {/* Botão flutuante criar */}
        <Box
          sx={{
            position: "fixed",
            bottom: 30,
            right: 30,
            width: 50,
            height: 50,
            bgcolor: "#4f46e5",
            color: "#fff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: 6,
            transition: "all 0.2s ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: 10 },
            zIndex: 1000,
          }}
          onClick={() =>
            showSnackbar("Funcionalidade de criar ainda não implementada", "info")
          }
        >
          <FaPlus size={20} />
        </Box>
      </Box>
    </Box>
  );
}
