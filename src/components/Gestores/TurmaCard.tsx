"use client";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { fetchTurmas, fetchCreateTurmas, fetchDeleteTurma } from "@/lib/TurmaApi";
import { fetchAlunos } from "@/lib/AlunoApi";
import { fetchDisciplinas } from "@/lib/disciplinaApi";
import { TurmaCompleta } from "@/Types/Turma";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Input from "@mui/material/Input";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Navbar from "./Navbar";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

export interface Aluno {
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
}

export interface Disciplina {
  Id: number;
  Nome: string;
  Codigo: string;
  CargaHoraria: number;
}

export default function TodasTurmasPage({ usuario }: { usuario: Usuario }) {
  const [turmas, setTurmas] = useState<TurmaCompleta[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [openCriar, setOpenCriar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);

  const [turmaSelecionada, setTurmaSelecionada] = useState<TurmaCompleta | null>(null);
  const [editTurma, setEditTurma] = useState<TurmaCompleta | null>(null);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Nova turma
  const [novaTurma, setNovaTurma] = useState({
    Nome: "",
    Serie: "",
    AnoLetivo: new Date().getFullYear(),
    Turno: "",
    Sala: "",
    CapacidadeMaxima: 0,
  });
  const [selectedAlunos, setSelectedAlunos] = useState<Aluno[]>([]);
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<Disciplina[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedTurmas = await fetchTurmas();
        setTurmas(fetchedTurmas);
      } catch (error) {
        console.error(error);
        showSnackbar("Erro ao carregar turmas", "error");
      } finally {
        setLoading(false);
      }
    };
    const fetchAlunosData = async () => {
      try {
        const alunosData = await fetchAlunos();
        setAlunos(alunosData || []);
      } catch (error) {
        console.error(error);
        showSnackbar("Erro ao carregar alunos", "error");
      }
    };
    const fetchDisciplinasData = async () => {
      try {
        const disciplinasData = await fetchDisciplinas();
        setDisciplinas(disciplinasData || []);
      } catch (error) {
        console.error(error);
        showSnackbar("Erro ao carregar disciplinas", "error");
      }
    };
    fetchData();
    fetchAlunosData();
    fetchDisciplinasData();
  }, []);

  // Funções de modais
  const handleOpenDetalhes = (turma: TurmaCompleta) => {
    setTurmaSelecionada(turma);
    setOpenDetalhes(true);
  };
  const handleCloseDetalhes = () => {
    setOpenDetalhes(false);
    setTurmaSelecionada(null);
  };

  const handleOpenEditar = () => {
    setEditTurma(turmaSelecionada);
    setOpenEditar(true);
  };
  const handleCloseEditar = () => {
    setOpenEditar(false);
    setEditTurma(null);
  };

  const handleEditChange = (field: keyof TurmaCompleta, value: any) => {
    if (!editTurma) return;
    setEditTurma({ ...editTurma, [field]: value });
  };

  const salvarAlteracoes = async () => {
    if (!editTurma) return;
    try {
      const res = await fetch(`http://localhost:3000/turmas/${editTurma.Id}/editar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTurma),
      });
      const data = await res.json();
      if (res.ok) {
        setTurmas((prev) => prev.map((t) => (t.Id === editTurma.Id ? editTurma : t)));
        showSnackbar("Turma atualizada com sucesso!", "success");
        handleCloseEditar();
        handleCloseDetalhes();
      } else {
        showSnackbar(data.message || "Erro ao atualizar turma", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao atualizar turma", "error");
    }
  };

const criarTurma = async () => {
  try {
    const payload = {
      nome: novaTurma.Nome,
      serie: novaTurma.Serie,
      anoLetivo: novaTurma.AnoLetivo,
      turno: novaTurma.Turno,
      sala: novaTurma.Sala,
      capacidadeMaxima: novaTurma.CapacidadeMaxima,
      alunos: selectedAlunos.map((a) => a.Id),
      disciplinas: selectedDisciplinas.map((d) => d.Id),
      professores: [],
    };

    const data = await fetchCreateTurmas(payload);
    setTurmas((prev) => [...prev, data]);
    showSnackbar("Turma criada com sucesso!", "success");
    setOpenCriar(false);
    setNovaTurma({
      Nome: "",
      Serie: "",
      AnoLetivo: new Date().getFullYear(),
      Turno: "",
      Sala: "",
      CapacidadeMaxima: 0,
    });
    setSelectedAlunos([]);
    setSelectedDisciplinas([]);
  } catch (error) {
    console.error(error);
    showSnackbar("Erro ao criar turma", "error");
  }
};


  const handleDeleteTurma = async (turma: TurmaCompleta) => {
    if (!window.confirm(`Deseja excluir a turma "${turma.Nome}"?`)) return;
    try {
      await fetchDeleteTurma(turma);
      setTurmas((prev) => prev.filter((t) => t.Id !== turma.Id));
      showSnackbar("Turma excluída com sucesso!", "success");
      handleCloseDetalhes();
    } catch (error) {
      console.error(error);
      showSnackbar("Erro ao excluir turma", "error");
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
      <main className="flex-1 overflow-y-auto p-6" style={{ display: "flex", flexDirection: "row",justifyContent: "space-between", overflowY: "auto" }}>
        <h1 className="text-2xl font-bold mb-6">Todas as Turmas</h1>

        {loading ? (
          <p>Carregando turmas...</p>
        ) : turmas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ width:"1020px", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", overflowY: "auto" }}>
            {turmas.map((turma) => (
              <div
                key={turma.Id}
                className="bg-white shadow-lg rounded-xl p-6 cursor-pointer hover:shadow-xl"
                onClick={() => handleOpenDetalhes(turma)}
              >
                <h2 className="text-xl font-bold">{turma.Nome}</h2>
                <p className="text-gray-600">
                  {turma.Serie} • {turma.AnoLetivo} • {turma.Turno}
                </p>
                <p className="text-sm text-gray-500">Sala: {turma.Sala}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma turma encontrada.</p>
        )}

        {/* Modal Detalhes */}
        <Modal open={openDetalhes} onClose={handleCloseDetalhes}>
          <Box sx={styleModal}>
            {turmaSelecionada && (
              <>
                <Typography variant="h6">{turmaSelecionada.Nome}</Typography>
                <Typography>Série: {turmaSelecionada.Serie} | Ano: {turmaSelecionada.AnoLetivo}</Typography>
                <Typography>Turno: {turmaSelecionada.Turno} | Sala: {turmaSelecionada.Sala}</Typography>

                <Typography sx={{ mt: 2, fontWeight: "bold" }}>Alunos:</Typography>
                <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                  {turmaSelecionada.alunos?.length ? (
                    turmaSelecionada.alunos.map((a) => <li key={a.Id}>{a.Nome}</li>)
                  ) : (
                    <li>Nenhum aluno nessa turma.</li>
                  )}
                </ul>

                <Typography sx={{ mt: 2, fontWeight: "bold" }}>Disciplinas:</Typography>
                <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                  {turmaSelecionada.disciplinas?.length ? (
                    turmaSelecionada.disciplinas.map((d) => <li key={d.Id}>{d.Nome}</li>)
                  ) : (
                    <li>Nenhuma disciplina cadastrada.</li>
                  )}
                </ul>

                <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button color="error" variant="outlined" onClick={() => handleDeleteTurma(turmaSelecionada)}>
                    Excluir
                  </Button>
                  <Button variant="contained" onClick={handleOpenEditar}>
                    Editar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Modal Editar */}
        <Modal open={openEditar} onClose={handleCloseEditar}>
          <Box sx={{ ...styleModal, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6">Editar Turma</Typography>
            <Input value={editTurma?.Nome || ""} placeholder="Nome" onChange={(e) => handleEditChange("Nome", e.target.value)} />
            <Input value={editTurma?.Serie || ""} placeholder="Série" onChange={(e) => handleEditChange("Serie", e.target.value)} />
            <Input
              type="number"
              value={editTurma?.AnoLetivo || ""}
              placeholder="Ano Letivo"
              onChange={(e) => handleEditChange("AnoLetivo", Number(e.target.value))}
            />
            <Input value={editTurma?.Turno || ""} placeholder="Turno" onChange={(e) => handleEditChange("Turno", e.target.value)} />
            <Input value={editTurma?.Sala || ""} placeholder="Sala" onChange={(e) => handleEditChange("Sala", e.target.value)} />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={handleCloseEditar}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={salvarAlteracoes}>
                Salvar
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal Criar */}
        <Modal open={openCriar} onClose={() => setOpenCriar(false)}>
          <Box
            sx={{
              borderRadius: 4,
              maxWidth: 600,
              bgcolor: "background.paper",
              p: 6,
              mx: "auto",
              my: "5vh",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: "#4F46E5" }}>
              Criar turma
            </Typography>

            <Input fullWidth placeholder="Nome" value={novaTurma.Nome} onChange={(e) => setNovaTurma({ ...novaTurma, Nome: e.target.value })} sx={{ mb: 3 }} />
            <Input fullWidth placeholder="Série" value={novaTurma.Serie} onChange={(e) => setNovaTurma({ ...novaTurma, Serie: e.target.value })} sx={{ mb: 3 }} />
            <Input type="number" fullWidth placeholder="Ano Letivo" value={novaTurma.AnoLetivo} onChange={(e) => setNovaTurma({ ...novaTurma, AnoLetivo: Number(e.target.value) })} sx={{ mb: 3 }} />
            <Input fullWidth placeholder="Turno" value={novaTurma.Turno} onChange={(e) => setNovaTurma({ ...novaTurma, Turno: e.target.value })} sx={{ mb: 3 }} />
            <Input fullWidth placeholder="Sala" value={novaTurma.Sala} onChange={(e) => setNovaTurma({ ...novaTurma, Sala: e.target.value })} sx={{ mb: 3 }} />
            <Input type="number" fullWidth placeholder="Capacidade Máxima" value={novaTurma.CapacidadeMaxima} onChange={(e) => setNovaTurma({ ...novaTurma, CapacidadeMaxima: Number(e.target.value) })} sx={{ mb: 3 }} />

            {/* Alunos */}
            <Typography sx={{ fontWeight: 600 }}>Selecione os alunos:</Typography>
            <Box sx={{ maxHeight: 150, overflowY: "auto", mb: 3, border: "1px solid #e5e7eb", borderRadius: 1, p: 2 }}>
              {alunos.map((a) => (
                <label key={a.RA} className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedAlunos.some((al) => al.RA === a.RA)} onChange={() => {
                    if (selectedAlunos.some((al) => al.RA === a.RA)) {
                      setSelectedAlunos(selectedAlunos.filter((al) => al.RA !== a.RA));
                    } else {
                      setSelectedAlunos([...selectedAlunos, a]);
                    }
                  }} />
                  {a.Nome}
                </label>
              ))}
            </Box>

            {/* Disciplinas */}
            <Typography sx={{ fontWeight: 600 }}>Selecione as disciplinas:</Typography>
            <Box sx={{ maxHeight: 150, overflowY: "auto", mb: 3, border: "1px solid #e5e7eb", borderRadius: 1, p: 2 }}>
              {disciplinas.map((d) => (
                <label key={d.Codigo} className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedDisciplinas.some((disc) => disc.Codigo === d.Codigo)} onChange={() => {
                    if (selectedDisciplinas.some((disc) => disc.Codigo === d.Codigo)) {
                      setSelectedDisciplinas(selectedDisciplinas.filter((disc) => disc.Codigo !== d.Codigo));
                    } else {
                      setSelectedDisciplinas([...selectedDisciplinas, d]);
                    }
                  }} />
                  {d.Nome}
                </label>
              ))}
            </Box>

            <Button variant="contained" fullWidth onClick={criarTurma} sx={{ backgroundColor: "#4F46E5" }}>
              Criar Turma
            </Button>
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
