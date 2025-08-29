"use client";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { fetchAlunos, createAluno, updateAluno, deleteAluno } from "@/lib/AlunoApi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Input from "@mui/material/Input";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Navbar from "../../Navbar";

export interface Aluno {
  Id?: number;
  Nome: string;
  CPF: string;
  Senha: string;
  Telefone: string;
  DataNascimento: string;
  Genero: string;
  FotoPerfil: string;
  Status: string;
  RA: string;
}

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

export default function TodasAlunosPage({ usuario }: { usuario: Usuario }) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [openCriar, setOpenCriar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);

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
    Nome: "",
    CPF: "",
    Senha: "",
    Telefone: "",
    DataNascimento: "",
    Genero: "",
    FotoPerfil: "",
    Status: "Ativo",
    RA: "",
  });

  useEffect(() => {
    const carregarAlunos = async () => {
      try {
        const dados = await fetchAlunos();
        setAlunos(dados);
      } catch (error) {
        console.error(error);
        showSnackbar("Erro ao carregar alunos", "error");
      } finally {
        setLoading(false);
      }
    };
    carregarAlunos();
  }, []);

  const salvarNovoAluno = async () => {
    try {
      const alunoCriado = await createAluno(novoAluno);
      setAlunos((prev) => [...prev, alunoCriado]);
      showSnackbar("Aluno cadastrado com sucesso!", "success");
      setOpenCriar(false);
      setNovoAluno({
        Nome: "",
        CPF: "",
        Senha: "",
        Telefone: "",
        DataNascimento: "",
        Genero: "",
        FotoPerfil: "",
        Status: "Ativo",
        RA: "",
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
      setAlunos((prev) => prev.map((a) => (a.Id === alunoAtualizado.Id ? alunoAtualizado : a)));
      showSnackbar("Aluno atualizado com sucesso!", "success");
      setOpenEditar(false);
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
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao excluir aluno", "error");
    }
  };

  const styleModal = {
    borderRadius: 4,
    maxWidth: 500,
    bgcolor: "background.paper",
    p: 4,
    mx: "auto",
    my: "10vh",
    maxHeight: "80vh",
    overflowY: "auto",
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      <Navbar usuario={usuario} />
      <main style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", flex: 1,maxWidth:"1024px", width: "100%" }} className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Todos os Alunos</h1>

        {loading ? (
          <p>Carregando alunos...</p>
        ) : alunos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alunos.map((aluno) => (
              <div
                key={aluno.Id}
                className="bg-white shadow-lg rounded-xl p-6 cursor-pointer hover:shadow-xl"
                onClick={() => {
                  setAlunoSelecionado(aluno);
                  setOpenEditar(true);
                }}
              >
                <h2 className="text-xl font-bold">{aluno.Nome}</h2>
                <p className="text-gray-600">RA: {aluno.RA}</p>
                <p className="text-sm text-gray-500">{aluno.CPF}</p>
                <p className="text-sm text-gray-500">Status: {aluno.Status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum aluno encontrado.</p>
        )}

        {/* Modal Criar */}
        <Modal open={openCriar} onClose={() => setOpenCriar(false)}>
          <Box sx={styleModal}>
            <Typography variant="h6" sx={{ mb: 3 }}>Cadastrar Aluno</Typography>
            <Input fullWidth placeholder="Nome" value={novoAluno.Nome} onChange={(e) => setNovoAluno({ ...novoAluno, Nome: e.target.value })} sx={{ mb: 2 }} />
            <Input fullWidth placeholder="CPF" value={novoAluno.CPF} onChange={(e) => setNovoAluno({ ...novoAluno, CPF: e.target.value })} sx={{ mb: 2 }} />
            <Input fullWidth placeholder="Telefone" value={novoAluno.Telefone} onChange={(e) => setNovoAluno({ ...novoAluno, Telefone: e.target.value })} sx={{ mb: 2 }} />
            <Input type="date" fullWidth value={novoAluno.DataNascimento} onChange={(e) => setNovoAluno({ ...novoAluno, DataNascimento: e.target.value })} sx={{ mb: 2 }} />
            <Input fullWidth placeholder="Gênero" value={novoAluno.Genero} onChange={(e) => setNovoAluno({ ...novoAluno, Genero: e.target.value })} sx={{ mb: 2 }} />
            <Input fullWidth placeholder="RA" value={novoAluno.RA} onChange={(e) => setNovoAluno({ ...novoAluno, RA: e.target.value })} sx={{ mb: 2 }} />
            <Input 
            fullWidth 
            type="password"
            placeholder="Senha"
            value={novoAluno.Senha} 
            onChange={(e) => setNovoAluno({ ...novoAluno, Senha: e.target.value })} 
            sx={{ mb: 2 }} 
          />
          <Button variant="contained" fullWidth onClick={salvarNovoAluno}>
              Salvar
            </Button>
          </Box>
        </Modal>

        {/* Modal Editar */}
        <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
          <Box sx={styleModal}>
            {alunoSelecionado && (
              <>
                <Typography variant="h6" sx={{ mb: 3 }}>Editar Aluno</Typography>
                <Input fullWidth value={alunoSelecionado.Nome} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, Nome: e.target.value })} sx={{ mb: 2 }} />
                <Input fullWidth value={alunoSelecionado.CPF} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, CPF: e.target.value })} sx={{ mb: 2 }} />
                <Input fullWidth value={alunoSelecionado.Telefone} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, Telefone: e.target.value })} sx={{ mb: 2 }} />
                <Input fullWidth value={alunoSelecionado.RA} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, RA: e.target.value })} sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                  <Button color="error" variant="outlined" onClick={() => excluirAluno(alunoSelecionado.Id)}>
                    Excluir
                  </Button>
                  <Button variant="contained" onClick={salvarEdicao}>
                    Salvar
                  </Button>
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
        <Box onClick={() => setOpenCriar(true)} className="fixed bottom-6 right-6 bg-indigo-600 text-white p-5 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors">
          <FaPlus size={20} />
        </Box>
      </main>
    </div>
  );
}
