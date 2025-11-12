"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import { fetchProfessores } from "@/lib/ProfessorApi";
import "./css/turmaCard.css";
import {  Divider, Grid, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';


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
  NomeDisciplina: string
  Codigo: string;
  CargaHoraria: number;
  Id_Professor: number;
}

interface Professor {
  Id: number;
  Nome: string;
  Email: string;
  FotoPerfil?: string | null;
  Disciplinas: number[]; // array de Ids das disciplinas
  TotalDisciplinas: number;
}

const styleModal = {
  borderRadius: 4,
  maxWidth: 600,
  bgcolor: "background.paper",
  p: 4,
  mx: "auto",
  my: "5vh",
  maxHeight: "80vh",
  overflowY: "auto",
};

export default function TodasTurmasPage({ usuario }: { usuario: Usuario }) {
  const [turmas, setTurmas] = useState<TurmaCompleta[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [professoresPorDisciplina, setProfessoresPorDisciplina] = useState<{ [disciplinaId: number]: number | null }>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  // Fetch professores, turmas, alunos, disciplinas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [turmasData, alunosData, disciplinasData, professoresData] = await Promise.all([
          fetchTurmas(),
          fetchAlunos(),
          fetchDisciplinas(),
          fetchProfessores(),
        ]);
        setTurmas(turmasData);
        setAlunos(alunosData || []);
        setDisciplinas(disciplinasData || []);
        setProfessores(professoresData || []);
      } catch (error) {
        console.error(error);
        showSnackbar("Erro ao carregar dados", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modais
  const handleOpenDetalhes = (turma: TurmaCompleta) => {
    setTurmaSelecionada(turma);
    setOpenDetalhes(true);
  };
  const handleCloseDetalhes = () => {
    setOpenDetalhes(false);
    setTurmaSelecionada(null);
  };

  const handleOpenEditar = () => {
    if (!turmaSelecionada) return;
    setEditTurma(turmaSelecionada);
    // Preencher professoresPorDisciplina no edit
    const map: { [discId: number]: number } = {};
      turmaSelecionada.professores?.forEach((p) => {
        const disciplinasIds = Array.isArray(p.Disciplinas) ? p.Disciplinas.map((d) => Number(d)) : [];
        disciplinasIds.forEach((discId) => {
          map[discId] = p.Id;
        });
      });
    setProfessoresPorDisciplina(map);
    setOpenEditar(true);
  };

  const handleCloseEditar = () => {
    setOpenEditar(false);
    setEditTurma(null);
    setProfessoresPorDisciplina({});
  };

  const handleEditChange = (field: keyof TurmaCompleta, value: string | number) => {
    if (!editTurma) return;
    setEditTurma({ ...editTurma, [field]: value });
  };

  // Salvar alterações
  const salvarAlteracoes = async () => {
    if (!editTurma) return;
    try {
      const payload = {
        nome: editTurma.Nome,
        serie: editTurma.Serie,
        anoLetivo: editTurma.AnoLetivo,
        turno: editTurma.Turno,
        sala: editTurma.Sala,
        capacidadeMaxima: editTurma.CapacidadeMaxima,
        alunos: editTurma.alunos?.map((a) => a.Id),
        disciplinas: editTurma.disciplinas?.map((d) => d.Id),
        professores: Object.entries(professoresPorDisciplina)
          .filter(([_, profId]) => profId !== null)
          .reduce<{ id: number; disciplinas: number[] }[]>((acc, [discId, profId]) => {
            const existing = acc.find((p) => p.id === profId);
            if (existing) {
              existing.disciplinas.push(Number(discId));
            } else {
              acc.push({ id: Number(profId), disciplinas: [Number(discId)] });
            }
            return acc;
          }, []),
      };

      const res = await fetch(`http://localhost:3001/turmas/${editTurma.Id}/editar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setTurmas((prev) => prev.map((t) => (t.Id === editTurma.Id ? { ...t, ...editTurma } : t)));
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

  // Criar turma
  const criarTurma = async () => {
    if (!novaTurma.Turno) {
      showSnackbar("Selecione um turno válido", "warning");
      return;
    }
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
        professores: Object.entries(professoresPorDisciplina)
          .filter(([_, profId]) => profId !== null)
          .reduce<{ id: number; disciplinas: number[] }[]>((acc, [discId, profId]) => {
            const existing = acc.find((p) => p.id === profId);
            if (existing) {
              existing.disciplinas.push(Number(discId));
            } else {
              acc.push({ id: Number(profId), disciplinas: [Number(discId)] });
            }
            return acc;
          }, []),
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
      setProfessoresPorDisciplina({});
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

  const filteredAlunos = useMemo(() => {
    return alunos.filter((aluno) =>
      aluno.Nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, alunos]);

  const isSelected = (ra: string) =>
    selectedAlunos.some((a) => a.RA === ra);

  const toggleAluno = (aluno: Aluno) => {
    if (isSelected(aluno.RA)) {
      setSelectedAlunos(selectedAlunos.filter((a) => a.RA !== aluno.RA));
    } else {
      setSelectedAlunos([...selectedAlunos, aluno]);
    }
  };

  const selectAll = () => {
    const notInTurma = filteredAlunos.filter(
      (a) => !isAlunoEmTurma(a.RA)
    );
    setSelectedAlunos([...selectedAlunos, ...notInTurma.filter(
      a => !isSelected(a.RA)
    )]);
  };

  const clearAll = () => {
    setSelectedAlunos([]);
  };

  // Verifica se aluno está em alguma turma
  const isAlunoEmTurma = (alunoRA: string) => {
    return turmas.some((turma) => turma.alunos?.some((a) => a.RA === alunoRA));
  };

  // Verifica se professor está disponível no turno
  const isProfessorDisponivelNoTurno = (professorId: number, turnoTurmaAtual: string) => {
    if (!turnoTurmaAtual) return true; // se turno não definido, não bloqueia
    return !turmas.some((turma) => {
      if (turma.Turno !== turnoTurmaAtual) return false;
      return turma.professores?.some((p) => p.Id === professorId);
    });
  };

  // Componente DashboardCards separado
  function DashboardCards() {
    const alunosComAula = alunos.filter((a) =>
      turmas.some((t) => t.alunos?.some((al) => al.RA === a.RA))
    );

    const professoresComAula = professores.filter((p) =>
      turmas.some((t) => t.professores?.some((prof) => prof.Id === p.Id))
    );
    

  return (
    <div className="dashboard-cards">
      <div className="card card-turmas">
        <h3>{turmas.length}</h3>
        <p>Turmas</p>
      </div>
      <div className="card card-alunos">
        <h3>{alunosComAula.length}</h3>
        <p>Alunos com aula</p>
      </div>
      <div className="card card-professores">
        <h3>{professoresComAula.length}</h3>
        <p>Professores com aula</p>
      </div>
    </div>
  );
  }

  return (
    <div className="page-container">
      <Navbar usuario={usuario} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="header flex justify-between items-center mb-6">
          <div>
            <h1>Todas as Turmas</h1>
            <p>Gerencie todas as turmas, alunos e disciplinas</p>
          </div>
          <button className="btn-nova-turma" onClick={() => setOpenCriar(true)}>
            + Nova Turma
          </button>
        </div>

        <DashboardCards />

        {loading ? (
          <p>Carregando turmas...</p>
        ) : turmas.length > 0 ? (
          <div className="turmas-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {turmas.map((turma) => (
              <div
                key={turma.Id}
                className="class-card bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
                onClick={() => handleOpenDetalhes(turma)}
              >
                <h2 className="class-name font-semibold text-lg">{turma.Nome}</h2>
                <p className="class-info text-gray-600">
                  {turma.Serie} • {turma.AnoLetivo} • {turma.Turno}
                </p>
                <p className="class-room text-sm text-gray-500">Sala: {turma.Sala}</p>

                <div className="card-details mt-3">
                  <div className="card-detail-row flex items-center gap-1 text-gray-700">
                    <GroupIcon fontSize="small" />
                    <span>{turma.alunos?.length || 0}/{turma.CapacidadeMaxima} alunos</span>
                  </div>

                  <div className="card-detail-row flex items-center gap-1 text-gray-700">
                    <MenuBookIcon fontSize="small" />
                    <span>{turma.disciplinas?.length || 0} disciplinas</span>
                  </div>

                  <div className="card-detail-row flex items-center gap-1 text-gray-700">
                    <CalendarTodayIcon fontSize="small" />
                    <span>Ano Letivo {turma.AnoLetivo}</span>
                  </div>

                  <div className="ocupacao-label mt-2 text-sm font-semibold">Ocupação da turma</div>
                  <div className="ocupacao-bar w-full h-2 bg-gray-300 rounded">
                    <div
                      className="ocupacao-fill h-2 bg-indigo-600 rounded"
                      style={{
                        width: `${
                          turma.CapacidadeMaxima
                            ? ((turma.alunos?.length || 0) / turma.CapacidadeMaxima) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma turma encontrada.</p>
        )}

        {/* Modal Detalhes */}
        <Modal open={openDetalhes} onClose={handleCloseDetalhes}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 650 },
              bgcolor: "background.paper",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              borderRadius: 4,
              p: { xs: 3, sm: 5 },
              maxHeight: "90vh",
              overflowY: "auto",
              background: "linear-gradient(145deg, #ffffff, #f7f8fa)",
            }}
          >
            {turmaSelecionada && (
              <>
                {/* Cabeçalho */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                    borderBottom: "1px solid #e0e0e0",
                    pb: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                      backgroundClip: "text",
                      textFillColor: "transparent",
                    }}
                  >
                    {turmaSelecionada.Nome}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteTurma(turmaSelecionada)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      borderColor: "#ef5350",
                      "&:hover": { backgroundColor: "#ffecec" },
                    }}
                  >
                    Excluir
                  </Button>
                </Box>

                {/* Informações gerais */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                    mb: 4,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "grey.50",
                      boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography color="text.secondary">Série</Typography>
                    <Typography fontWeight="bold">{turmaSelecionada.Serie}</Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "grey.50",
                      boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography color="text.secondary">Ano Letivo</Typography>
                    <Typography fontWeight="bold">{turmaSelecionada.AnoLetivo}</Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "grey.50",
                      boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography color="text.secondary">Turno</Typography>
                    <Typography fontWeight="bold">{turmaSelecionada.Turno}</Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "grey.50",
                      boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography color="text.secondary">Sala</Typography>
                    <Typography fontWeight="bold">{turmaSelecionada.Sala}</Typography>
                  </Box>
                </Box>

                {/* Alunos */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ display: "flex", alignItems: "center", mb: 1.5, color: "black" }}
                  >
                    <SchoolIcon sx={{ mr: 1 }} /> Alunos
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      listStyle: "none",
                      p: 0,
                      m: 0,
                      maxHeight: 180,
                      overflowY: "auto",
                      bgcolor: "#fafafa",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
                      "& li": {
                        py: 0.8,
                        px: 2,
                        borderBottom: "1px solid #f0f0f0",
                      },
                      "& li:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    {turmaSelecionada.alunos?.length ? (
                      turmaSelecionada.alunos.map((a) => <li key={a.Id}>{a.Nome}</li>)
                    ) : (
                      <li>Nenhum aluno nessa turma.</li>
                    )}
                  </Box>
                </Box>

                {/* Disciplinas */}
                <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ display: "flex", alignItems: "center", mb: 1.5, color: "black" }}
                >
                  <MenuBookIcon sx={{ mr: 1 }} /> Disciplinas e Professores
                </Typography>
                  <Box
                    component="ul"
                    sx={{
                      listStyle: "none",
                      p: 0,
                      m: 0,
                      maxHeight: 180,
                      overflowY: "auto",
                      bgcolor: "#fafafa",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
                      "& li": {
                        py: 0.8,
                        px: 2,
                        borderBottom: "1px solid #f0f0f0",
                      },
                      "& li:last-child": {
                        borderBottom: "none",
                      },
                    }}
                  >
                    {turmaSelecionada.disciplinas?.length ? (
                      turmaSelecionada.disciplinas.map((d) => {
                        const profId = turmaSelecionada.professores?.find((p) =>
                          p.Disciplinas.includes(d.Id.toString())
                        )?.Id;
                        const prof = professores.find((p) => p.Id === profId);
                        return (
                          <li key={d.Id}>
                            <strong>{d.Nome}</strong>{" "}
                            {prof ? (
                              <span style={{ color: "#555" }}>– {prof.Nome}</span>
                            ) : (
                              ""
                            )}
                          </li>
                        );
                      })
                    ) : (
                      <li>Nenhuma disciplina cadastrada.</li>
                    )}
                  </Box>
                </Box>

                {/* Ações */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleOpenEditar}
                    sx={{
                      borderRadius: 3,
                      textTransform: "none",
                      px: 3,
                      borderColor: "#1976d2",
                      color: "#1976d2",
                      fontWeight: "500",
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCloseDetalhes}
                    sx={{
                      borderRadius: 3,
                      textTransform: "none",
                      px: 3,
                      background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                      fontWeight: "500",
                      "&:hover": { background: "linear-gradient(90deg, #1565c0, #2196f3)" },
                    }}
                  >
                    Fechar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Modal Editar */}
        <Modal open={openEditar} onClose={handleCloseEditar}>
          <Box
            sx={{
              ...styleModal,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              p: { xs: 3, sm: 4 },
              width: { xs: "90%", sm: 600 },
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 4,
              bgcolor: "background.paper",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Editar Turma
            </Typography>

            {/* Campos gerais da turma */}
            <Box sx={{ display: "grid", gap: 2 }}>
              <Input
                value={editTurma?.Nome || ""}
                placeholder="Nome"
                onChange={(e) => handleEditChange("Nome", e.target.value)}
                fullWidth
              />
              <Input
                value={editTurma?.Serie || ""}
                placeholder="Série"
                onChange={(e) => handleEditChange("Serie", e.target.value)}
                fullWidth
              />
              <Input
                type="number"
                value={editTurma?.AnoLetivo || ""}
                placeholder="Ano Letivo"
                onChange={(e) => handleEditChange("AnoLetivo", Number(e.target.value))}
                fullWidth
              />
              <Select
                value={editTurma?.Turno || ""}
                onChange={(e) => handleEditChange("Turno", e.target.value)}
                displayEmpty
                fullWidth
                sx={{
                  borderRadius: 2,
                  "& .MuiSelect-select": { padding: "10px 12px" },
                }}
              >
                <MenuItem value="">Selecione o turno</MenuItem>
                <MenuItem value="Manhã">Manhã</MenuItem>
                <MenuItem value="Tarde">Tarde</MenuItem>
              </Select>
              <Input
                value={editTurma?.Sala || ""}
                placeholder="Sala"
                onChange={(e) => handleEditChange("Sala", e.target.value)}
                fullWidth
              />
              <Input
                type="number"
                value={editTurma?.CapacidadeMaxima || ""}
                placeholder="Capacidade Máxima"
                onChange={(e) => handleEditChange("CapacidadeMaxima", Number(e.target.value))}
                fullWidth
              />
            </Box>

            {/* Professores por disciplina */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              Professores por disciplina:
            </Typography>
            {editTurma?.disciplinas?.map((d) => (
              <Box
                key={d.Id}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "grey.50",
                  boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
                }}
              >
                <Typography fontWeight={500} sx={{ mb: 1 }}>
                  {d.Nome}
                </Typography>
                <Select
                  value={professoresPorDisciplina[d.Id] ?? ""}
                  onChange={(e) =>
                    setProfessoresPorDisciplina({
                      ...professoresPorDisciplina,
                      [d.Id]: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  displayEmpty
                  fullWidth
                  sx={{ borderRadius: 2, "& .MuiSelect-select": { padding: "10px 12px" } }}
                >
                  <MenuItem value="">Selecione um professor</MenuItem>
                  {professores.map((prof) => (
                    <MenuItem
                      key={prof.Id}
                      value={prof.Id}
                      disabled={
                        !isProfessorDisponivelNoTurno(prof.Id, editTurma?.Turno || "") &&
                        professoresPorDisciplina[d.Id] !== prof.Id
                      }
                    >
                      {prof.Nome}{" "}
                      {!isProfessorDisponivelNoTurno(prof.Id, editTurma?.Turno || "") &&
                      professoresPorDisciplina[d.Id] !== prof.Id
                        ? "(Indisponível no turno)"
                        : ""}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            ))}

            {/* Botões */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCloseEditar}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  px: 3,
                  borderColor: "grey.400",
                  "&:hover": { backgroundColor: "grey.100" },
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={salvarAlteracoes}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  px: 3,
                  background: "linear-gradient(90deg, #1976d2, #42a5f5)",
                  "&:hover": { background: "linear-gradient(90deg, #1565c0, #2196f3)" },
                }}
              >
                Salvar
              </Button>
            </Box>
          </Box>
        </Modal>

      {/* Modal de criação de turma */}
      <Modal open={openCriar} onClose={() => setOpenCriar(false)}>
        <Box
          sx={{
            maxWidth: 700,
            width: "90%",
            mx: "auto",
            my: "5vh",
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            bgcolor: "background.paper",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            maxHeight: "80vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Título */}
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#4F46E5" }}>
            Criar nova turma
          </Typography>

          {/* Campos da turma */}
          <TextField
            label="Nome da Turma"
            placeholder="Ex: Turma A"
            fullWidth
            required
            value={novaTurma.Nome}
            onChange={(e) => setNovaTurma({ ...novaTurma, Nome: e.target.value })}
          />
          <TextField
            select
            label="Série"
            fullWidth
            required
            value={novaTurma.Serie}
            onChange={(e) => setNovaTurma({ ...novaTurma, Serie: e.target.value })}
          >
            <MenuItem value="">Selecione a série</MenuItem>
            <MenuItem value="1º">1º Ano</MenuItem>
            <MenuItem value="2º">2º Ano</MenuItem>
            <MenuItem value="3º">3º Ano</MenuItem>
          </TextField>
          <TextField
            label="Ano Letivo"
            type="number"
            fullWidth
            required
            inputProps={{ min: 2020, max: 2030 }}
            value={novaTurma.AnoLetivo}
            onChange={(e) => setNovaTurma({ ...novaTurma, AnoLetivo: Number(e.target.value) })}
          />
          <TextField
            select
            label="Turno"
            fullWidth
            required
            value={novaTurma.Turno}
            onChange={(e) => setNovaTurma({ ...novaTurma, Turno: e.target.value })}
          >
            <MenuItem value="">Selecione o turno</MenuItem>
            <MenuItem value="Manhã">Manhã</MenuItem>
            <MenuItem value="Tarde">Tarde</MenuItem>
          </TextField>
          <TextField
            label="Sala"
            placeholder="Ex: Sala 101"
            fullWidth
            required
            value={novaTurma.Sala}
            onChange={(e) => setNovaTurma({ ...novaTurma, Sala: e.target.value })}
          />
          <TextField
            label="Capacidade Máxima"
            type="number"
            inputProps={{ min: 1, max: 100 }}
            fullWidth
            required
            value={novaTurma.CapacidadeMaxima}
            onChange={(e) => setNovaTurma({ ...novaTurma, CapacidadeMaxima: Number(e.target.value) })}
            helperText="Máximo de alunos permitidos"
          />

          <Divider sx={{ my: 2 }} />

          {/* Seleção de alunos */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={600}>Selecionar alunos</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAlunos.length} selecionados
              </Typography>
            </Box>

            <TextField
              fullWidth
              placeholder="Buscar aluno por nome..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="disabled" />
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                maxHeight: 150,
                overflowY: "auto",
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "#fafafa",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {filteredAlunos.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center">
                  Nenhum aluno encontrado
                </Typography>
              ) : (
                filteredAlunos.map((a) => (
                  <Box key={a.RA} sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={isSelected(a.RA)}
                      disabled={isAlunoEmTurma(a.RA)}
                      onChange={() => toggleAluno(a)}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">
                      {a.Nome}{" "}
                      {isAlunoEmTurma(a.RA) && (
                        <Typography component="span" color="error" fontSize="0.8rem">
                          (Já em turma)
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap">
              <Button size="small" variant="contained" onClick={selectAll}>
                Selecionar Todos
              </Button>
              <Button size="small" variant="outlined" color="secondary" onClick={clearAll}>
                Limpar Seleção
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Seleção de disciplinas */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography fontWeight={600}>Selecionar disciplinas</Typography>
            <Box
              sx={{
                maxHeight: 150,
                overflowY: "auto",
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "#fafafa",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {disciplinas.map((d) => (
                <Box key={d.Id} sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={selectedDisciplinas.some((disc) => disc.Id === d.Id)}
                    onChange={() => {
                      const updated = selectedDisciplinas.some((disc) => disc.Id === d.Id)
                        ? selectedDisciplinas.filter((disc) => disc.Id !== d.Id)
                        : [...selectedDisciplinas, d];
                      setSelectedDisciplinas(updated);

                      if (!updated.find((disc) => disc.Id === d.Id)) {
                        const copy = { ...professoresPorDisciplina };
                        delete copy[d.Id];
                        setProfessoresPorDisciplina(copy);
                      }
                    }}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">{d.Nome}</Typography>
                </Box>
              ))}
            </Box>

            {selectedDisciplinas.length > 0 &&
              selectedDisciplinas.map((d) => (
                <Box key={d.Id} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <TextField
                    select
                    fullWidth
                    label={`Professor para ${d.Nome}`}
                    value={professoresPorDisciplina[d.Id] ?? ""}
                    onChange={(e) =>
                      setProfessoresPorDisciplina({
                        ...professoresPorDisciplina,
                        [d.Id]: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <MenuItem value="">Selecione um professor</MenuItem>
                    {professores.map((prof) => (
                      <MenuItem
                        key={prof.Id}
                        value={prof.Id}
                        disabled={!isProfessorDisponivelNoTurno(prof.Id, novaTurma.Turno)}
                      >
                        {prof.Nome}{" "}
                        {!isProfessorDisponivelNoTurno(prof.Id, novaTurma.Turno) && "(Indisponível)"}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              ))}
          </Box>

          {/* Botão criar */}
          <Button
            variant="contained"
            fullWidth
            onClick={criarTurma}
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              background: "linear-gradient(90deg, #4F46E5, #6366F1)",
              "&:hover": { background: "linear-gradient(90deg, #4338CA, #4F46E5)" },
            }}
          >
            Criar Turma
          </Button>
        </Box>
      </Modal>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled">
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>

        {/* Botão flutuante Criar */}
        <Box
          onClick={() => setOpenCriar(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-5 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors flex items-center justify-center"
          style={{ userSelect: "none" }}
        >
          <FaPlus size={24} />
        </Box>
      </main>
    </div>
  );
}
