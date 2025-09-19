"use client";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { fetchAlunos, createAluno, updateAluno, deleteAluno } from "@/lib/AlunoApi";
import { TurmaCompleta } from "@/lib/TurmaApi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Input from "@mui/material/Input";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Navbar from "../../Navbar";
import styles from "../css/TodasAlunosPage.module.css";
import { Radio, RadioGroup, FormControl, FormControlLabel, FormLabel } from "@mui/material";

interface AlunoAPI {
  Id: number;
  Nome: string;
  CPF: string;
  Senha: string;
  Telefone: string;
  DataNascimento: string;
  Genero: string;
  FotoPerfil: string;
  Status: string;
  RA: string;
  TurmaId?: number;
}


// types.ts
interface Aluno {
  Id: number;
  Nome: string;
  CPF: string;
  Senha: string;
  Telefone: string;
  DataNascimento: string;
  Genero: string;
  FotoPerfil: string;
  Status: string;
  RA: string;
  TurmaId?: number;
}

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface MeuComponenteProps {
  Id: number;
  turma: TurmaCompleta;
}
interface TurmaCompleta {
    Id: number;
    Nome: string;
    Serie: string | null;
    AnoLetivo: number;
    Turno: string | null;
    Sala?: string;
    CapacidadeMaxima?: number;
    alunos?: AlunoAPI[];
}

export default function TodasAlunosPage({ usuario }: { usuario: Usuario }) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<MeuComponenteProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [openCriar, setOpenCriar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Novo aluno
  const [novoAluno, setNovoAluno] = useState<Aluno>({
    Id: 0,
    Nome: "",
    CPF: "",
    Senha: "",
    Telefone: "",
    DataNascimento: "",
    Genero: "",
    FotoPerfil: "",
    Status: "Ativo",
    RA: "",
    TurmaId: undefined,
  });


  // Carregar alunos + turmas
useEffect(() => {
  const carregarDados = async () => {
    try {
    const alunosAPI: AlunoAPI[] = await fetchAlunos();

      if (!alunosAPI) {
        showSnackbar("Erro ao carregar alunos", "error");
        return;
      }

      // Buscar todas as turmas
      const response = await fetch("http://localhost:3001/turmas/");
      const dados = await response.json();

      if (dados.success && Array.isArray(dados.turmas)) {
        const turmasData: TurmaCompleta[] = dados.turmas;

        setTurmas(
          turmasData.map((t: TurmaCompleta) => ({
            Id: t.Id,
            turma: t,
          }))
        );

        // Associar RA -> TurmaId
      const alunosComTurma: Aluno[] = alunosAPI.map((aluno: AlunoAPI) => {
        const turmaEncontrada = turmasData.find((turma: TurmaCompleta) =>
          turma.alunos?.some((a: AlunoAPI) => a.RA === aluno.RA)
        );
        return {
          Id: aluno.Id, // ou outro valor que faça sentido para o seu aplicativo
          Nome: aluno.Nome,
          CPF: aluno.CPF,
          Senha: aluno.Senha,
          Telefone: aluno.Telefone,
          DataNascimento: aluno.DataNascimento,
          Genero: aluno.Genero,
          FotoPerfil: aluno.FotoPerfil,
          Status: aluno.Status,
          RA: aluno.RA,
          TurmaId: turmaEncontrada ? turmaEncontrada.Id : undefined,
        };
      });

      setAlunos(alunosComTurma);
      } else {
        showSnackbar("Erro ao carregar turmas", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  carregarDados();
}, []);


  const salvarNovoAluno = async () => {
    try {
      const alunoCriado = await createAluno(novoAluno);
      setAlunos((prev) => [...prev, alunoCriado]);
      showSnackbar("Aluno cadastrado com sucesso!", "success");
      setOpenCriar(false);
      setNovoAluno({
        Id: 0,
        Nome: "",
        CPF: "",
        Senha: "",
        Telefone: "",
        DataNascimento: "",
        Genero: "",
        FotoPerfil: "",
        Status: "Ativo",
        RA: "",
        TurmaId: undefined,
      });
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao cadastrar aluno", "error");
    }
  };

  const salvarEdicao = async () => {
    if (!alunoSelecionado) return;
    try {
      const alunoAtualizado = await updateAluno(alunoSelecionado);
      setAlunos((prev) =>
        prev.map((a) => (a.Id === alunoAtualizado.Id ? alunoAtualizado : a))
      );
      showSnackbar("Aluno atualizado com sucesso!", "success");
      setOpenEditar(false);
      setEditMode(false);
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao atualizar aluno", "error");
    }
  };

  const excluirAluno = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Deseja realmente excluir este aluno?")) return;
    try {
      await deleteAluno(id);
      setAlunos((prev) => prev.filter((a) => a.Id !== id));
      showSnackbar("Aluno excluído com sucesso!", "success");
      setOpenEditar(false);
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao excluir aluno", "error");
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full ${styles["page-container"]}`}>
      <Navbar usuario={usuario} />
      <main
        style={{
          position: "relative",
          left: "100px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          maxWidth: "1024px",
          width: "100%",
          padding: "1.5rem 1.5rem 3rem",
        }}
        className={`flex-1 overflow-y-auto p-6 max-w-[1024px] mx-auto w-full ${styles["main-content"]}`}
      >
        <h1 className={styles["page-title"]}>Todos os Alunos</h1>

        {loading ? (
          <p>Carregando alunos...</p>
        ) : alunos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alunos.map((aluno) => (
              <div
                key={aluno.Id}
                className={`${styles["aluno-card"]} cursor-pointer`}
                onClick={() => {
                  setAlunoSelecionado(aluno);
                  setOpenEditar(true);
                  setEditMode(false);
                }}
              >
                <h2 className={styles["aluno-nome"]}>{aluno.Nome}</h2>
                <p className={styles["aluno-info"]}>RA: {aluno.RA}</p>
                <p className={styles["aluno-info"]}>{aluno.CPF}</p>
                <p className={styles["aluno-status"]}>Status: {aluno.Status}</p>
                <p className={styles["aluno-info"]}>
                  Turma: {turmas.find((t) => t.Id === aluno.TurmaId)?.turma.Nome || "Sem turma"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum aluno encontrado.</p>
        )}

        {/* Modal Criar */}
        <Modal open={openCriar} onClose={() => setOpenCriar(false)}>
          <Box className={styles["modal-box"]}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Cadastrar Aluno
            </Typography>
            <Input placeholder="Nome" value={novoAluno.Nome} onChange={(e) => setNovoAluno({ ...novoAluno, Nome: e.target.value })} />
            <Input placeholder="RA" value={novoAluno.RA} onChange={(e) => setNovoAluno({ ...novoAluno, RA: e.target.value })} />
            <Input placeholder="CPF" value={novoAluno.CPF} onChange={(e) => setNovoAluno({ ...novoAluno, CPF: e.target.value })} />
            <Input placeholder="Senha" type="password" value={novoAluno.Senha} onChange={(e) => setNovoAluno({ ...novoAluno, Senha: e.target.value })} />
            <Input placeholder="Data de Nascimento" type="date" value={novoAluno.DataNascimento} onChange={(e) => setNovoAluno({ ...novoAluno, DataNascimento: e.target.value })} />
            <Input placeholder="Telefone" value={novoAluno.Telefone} onChange={(e) => setNovoAluno({ ...novoAluno, Telefone: e.target.value })} />

            <FormControl>
              <FormLabel>Gênero</FormLabel>
              <RadioGroup row value={novoAluno.Genero} onChange={(e) => setNovoAluno({ ...novoAluno, Genero: e.target.value })}>
                <FormControlLabel value="Masculino" control={<Radio />} label="Masculino" />
                <FormControlLabel value="Feminino" control={<Radio />} label="Feminino" />
              </RadioGroup>
            </FormControl>

            <Button fullWidth sx={{ mt: 2 }} onClick={salvarNovoAluno}>Salvar</Button>
          </Box>
        </Modal>

        {/* Modal Editar / Visualizar */}
        <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
          <Box className={styles["modal-box"]}>
            {alunoSelecionado && !editMode && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>Informações do Aluno</Typography>
                <p><strong>Nome:</strong> {alunoSelecionado.Nome}</p>
                <p><strong>RA:</strong> {alunoSelecionado.RA}</p>
                <p><strong>CPF:</strong> {alunoSelecionado.CPF}</p>
                <p><strong>Status:</strong> {alunoSelecionado.Status}</p>
                <p><strong>Gênero:</strong> {alunoSelecionado.Genero}</p>
                <p><strong>Telefone:</strong> {alunoSelecionado.Telefone}</p>
                <p><strong>Data Nascimento:</strong> {alunoSelecionado.DataNascimento}</p>
                <p><strong>Turma:</strong> {turmas.find((t) => t.Id === alunoSelecionado.TurmaId)?.turma.Nome || "Sem turma"}</p>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button variant="contained" onClick={() => setEditMode(true)}>Editar</Button>
                  <Button variant="outlined" color="error" onClick={() => excluirAluno(alunoSelecionado.Id)}>Excluir</Button>
                </Box>
              </>
            )}

            {alunoSelecionado && editMode && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>Editar Aluno</Typography>
                <Input placeholder="Nome" value={alunoSelecionado.Nome} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, Nome: e.target.value })} />
                <Input placeholder="RA" value={alunoSelecionado.RA} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, RA: e.target.value })} />
                <Input placeholder="CPF" value={alunoSelecionado.CPF} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, CPF: e.target.value })} />
                <Input placeholder="Telefone" value={alunoSelecionado.Telefone} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, Telefone: e.target.value })} />
                <Input placeholder="Data Nascimento" type="date" value={alunoSelecionado.DataNascimento} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, DataNascimento: e.target.value })} />

                <FormControl>
                  <FormLabel>Gênero</FormLabel>
                  <RadioGroup row value={alunoSelecionado.Genero} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, Genero: e.target.value })}>
                    <FormControlLabel value="Masculino" control={<Radio />} label="Masculino" />
                    <FormControlLabel value="Feminino" control={<Radio />} label="Feminino" />
                  </RadioGroup>
                </FormControl>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <FormLabel>Turma</FormLabel>
                  <select value={alunoSelecionado.TurmaId || ""} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, TurmaId: Number(e.target.value) })}>
                    <option value="">Selecione uma turma</option>
                    {turmas.map((turma) => (
                      <option key={turma.Id} value={turma.Id}>{turma.turma.Nome}</option>
                    ))}
                  </select>
                </FormControl>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button variant="outlined" color="error" onClick={() => excluirAluno(alunoSelecionado.Id)}>Excluir</Button>
                  <Button variant="contained" onClick={salvarEdicao}>Salvar</Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Snackbar */}
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <MuiAlert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled">
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>

        {/* Botão flutuante Criar */}
        <Box onClick={() => setOpenCriar(true)} className={styles["floating-button"]}>
          <FaPlus size={20} />
        </Box>
      </main>
    </div>
  );
}
