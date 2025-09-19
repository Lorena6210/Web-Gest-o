"use client";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Navbar from "../Navbar";
import styles from "./css/TodosResponsaveisPage.module.css";

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
    <div className={`flex flex-col h-screen w-full ${styles["page-container"]}`}>
      <Navbar usuario={usuario} />
      <main className={`${styles["main-content"]}`} style={{ width: "100%", gap: "20px" }}>
        <Typography variant="h4" className={styles["page-title"]}>
          Todos os Responsáveis
        </Typography>

        {loading ? (
          <Typography>Carregando responsáveis...</Typography>
        ) : responsaveis.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{
              width: "100%",
              flexWrap: "wrap",
              justifyContent: "center",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {responsaveis.map((r) => (
              <Box
                key={r.Id}
                className={styles["responsavel-card"]}
                onClick={() => handleOpenResponsavel(r)}
              >
                <Typography className={styles["responsavel-nome"]}>
                  {r.Nome}
                </Typography>
                <Typography className={styles["responsavel-info"]}>
                  Email: {r.Email || "Não informado"}
                </Typography>
                <Typography className={styles["responsavel-info"]}>
                  Telefone: {r.Telefone || "Não informado"}
                </Typography>
                <Typography className={styles["responsavel-info"]}>
                  Parentesco: {r.Parentesco}
                </Typography>
              </Box>
            ))}
          </div>
        ) : (
          <Typography>Nenhum responsável encontrado.</Typography>
        )}

        {/* Modal do responsável */}
        <Modal open={openResponsavel} onClose={() => setOpenResponsavel(false)}>
          <Box className={styles["modal-box"]}>
            {responsavelSelecionado && (
              <>
                <Typography variant="h6">
                  {responsavelSelecionado.Nome}
                </Typography>
                <Typography>Email: {responsavelSelecionado.Email}</Typography>
                <Typography>Telefone: {responsavelSelecionado.Telefone}</Typography>
                <Typography>Parentesco: {responsavelSelecionado.Parentesco}</Typography>
                <Typography>CPF: {responsavelSelecionado.CPF}</Typography>
                <Typography>Status: {responsavelSelecionado.Status}</Typography>

                <Typography sx={{ mt: 2, fontWeight: "bold" }}>
                  Alunos vinculados:
                </Typography>
                {loadingAlunos ? (
                  <Typography>Carregando alunos...</Typography>
                ) : alunos.length > 0 ? (
                  <ul className={styles["alunos-lista"]}>
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
          className={styles["floating-button"]}
          onClick={() =>
            showSnackbar("Funcionalidade de criar ainda não implementada", "info")
          }
        >
          <FaPlus size={20} />
        </Box>
      </main>
    </div>
  );
}
