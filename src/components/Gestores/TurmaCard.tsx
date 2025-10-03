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
      const disciplinasIds = p.Disciplinas.map((d) => Number(d));
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

<<<<<<< HEAD
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
      <div className="dashboard-cards flex gap-6 mb-6">
        <div className="card bg-indigo-600 text-white p-4 rounded-lg shadow-md flex-1 text-center">
          <h3 className="text-2xl font-bold">{turmas.length}</h3>
          <p>Turmas</p>
        </div>
        <div className="card bg-green-600 text-white p-4 rounded-lg shadow-md flex-1 text-center">
          <h3 className="text-2xl font-bold">{alunosComAula.length}</h3>
          <p>Alunos com aula</p>
        </div>
        <div className="card bg-yellow-600 text-white p-4 rounded-lg shadow-md flex-1 text-center">
          <h3 className="text-2xl font-bold">{professoresComAula.length}</h3>
          <p>Professores com aula</p>
        </div>
      </div>
    );
  }

  return (
  <div className="page-container">
  <Navbar usuario={usuario} />
  <main className="flex-1 overflow-y-auto p-6">
    <div className="header">
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
      <div className="turmas-grid">
        {turmas.map((turma) => (
          <div
            key={turma.Id}
            className="class-card"
            onClick={() => handleOpenDetalhes(turma)}
          >
            <h2 className="class-name">{turma.Nome}</h2>
            <p className="class-info">
              {turma.Serie} • {turma.AnoLetivo} • {turma.Turno}
            </p>
            <p className="class-room">Sala: {turma.Sala}</p>

            {/* detalhes internos */}
          <div className="card-details">
            <div className="card-detail-row">
              <GroupIcon fontSize="small" style={{ marginRight: 6, color: '#555' }} />
              <span>{turma.alunos?.length || 0}/{turma.CapacidadeMaxima} alunos</span>
            </div>

            <div className="card-detail-row">
              <MenuBookIcon fontSize="small" style={{ marginRight: 6, color: '#555' }} />
              <span>{turma.disciplinas?.length || 0} disciplinas</span>
            </div>

            <div className="card-detail-row">
              <CalendarTodayIcon fontSize="small" style={{ marginRight: 6, color: '#555' }} />
              <span>Ano Letivo {turma.AnoLetivo}</span>
            </div>

            <div className="ocupacao-label">Ocupação da turma</div>
            <div className="ocupacao-bar">
              <div
                className="ocupacao-fill"
                style={{
                  width: `${
                    turma.CapacidadeMaxima
                      ? (turma.alunos?.length || 0) / turma.CapacidadeMaxima * 100
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

=======
  const styleModal = {
    maxWidth: 600,
    width: "100%",
    bgcolor: "background.paper",
    p: 4,
    borderRadius: "16px",
    boxShadow: 24,
    maxHeight: "80vh",
    overflowY: "auto",
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      <Navbar usuario={usuario} />
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-6 max-w-7xl mx-auto" style={{display: "flex", flexDirection:"row",justifyContent:"space-between"}}>
        <h1 className="text-3xl font-bold text-gray-800">Todas as Turmas</h1>

        {loading ? (
          <p className="text-gray-500">Carregando turmas...</p>
        ) : turmas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {turmas.map((turma) => (
              <div
                key={turma.Id}
                className="bg-white shadow-md hover:shadow-xl rounded-xl p-6 cursor-pointer transition-transform transform hover:scale-105 flex flex-col gap-2"
                onClick={() => handleOpenDetalhes(turma)}
              >
                <h2 className="text-xl font-semibold text-gray-800">{turma.Nome}</h2>
                <p className="text-gray-600">{turma.Serie} • {turma.AnoLetivo} • {turma.Turno}</p>
                <p className="text-sm text-gray-400">Sala: {turma.Sala}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma turma encontrada.</p>
        )}
>>>>>>> c3ba902082a8f24951e46bcfa1dc1f75de15dc45

        {/* Modal Detalhes */}
        <Modal open={openDetalhes} onClose={handleCloseDetalhes}>
          <Box sx={styleModal}>
            {turmaSelecionada && (
              <>
<<<<<<< HEAD
                <Typography variant="h6">{turmaSelecionada.Nome}</Typography>
                <Typography>
                  Série: {turmaSelecionada.Serie} | Ano: {turmaSelecionada.AnoLetivo}
                </Typography>
                <Typography>
                  Turno: {turmaSelecionada.Turno} | Sala: {turmaSelecionada.Sala}
                </Typography>
=======
                <Typography variant="h6" sx={{ mb: 1 }}>{turmaSelecionada.Nome}</Typography>
                <Typography>Série: {turmaSelecionada.Serie} | Ano: {turmaSelecionada.AnoLetivo}</Typography>
                <Typography>Turno: {turmaSelecionada.Turno} | Sala: {turmaSelecionada.Sala}</Typography>
>>>>>>> c3ba902082a8f24951e46bcfa1dc1f75de15dc45

                <Typography sx={{ mt: 2, fontWeight: "bold" }}>Alunos:</Typography>
                <ul className="list-disc list-inside max-h-64 overflow-y-auto">
                  {turmaSelecionada.alunos?.length ? (
                    turmaSelecionada.alunos.map((a) => <li key={a.Id}>{a.Nome}</li>)
                  ) : (
                    <li>Nenhum aluno nessa turma.</li>
                  )}
                </ul>

                <Typography sx={{ mt: 2, fontWeight: "bold" }}>Disciplinas e Professores:</Typography>
                <ul className="list-disc list-inside max-h-64 overflow-y-auto">
                  {turmaSelecionada.disciplinas?.length ? (
                    turmaSelecionada.disciplinas.map((d) => {
<<<<<<< HEAD
                      const profId = turmaSelecionada.professores?.find((p) =>
                        p.Disciplinas.includes(d.Id)
                      )?.Id;
=======
                      const profId = turmaSelecionada.professores?.find((p) => p.Disciplinas.includes(d.Id.toString()))?.Id;
>>>>>>> c3ba902082a8f24951e46bcfa1dc1f75de15dc45
                      const prof = professores.find((p) => p.Id === profId);
                      return (
                        <li key={d.Id}>
                          {d.Nome} {prof ? ` - Professor: ${prof.Nome}` : ""}
                        </li>
                      );
                    })
                  ) : (
                    <li>Nenhuma disciplina cadastrada.</li>
                  )}
                </ul>
              </>
            )}
            {turmaSelecionada && (
<<<<<<< HEAD
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button onClick={() => handleOpenEditar()} sx={{ mr: 2 }}>
                  Editar
                </Button>
                <Button onClick={() => handleDeleteTurma(turmaSelecionada)} sx={{ mr: 2 }}>
                  Excluir
                </Button>
                <Button onClick={handleCloseDetalhes}>Fechar</Button>
=======
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
                <Button variant="outlined" onClick={handleOpenEditar}>Editar</Button>
                <Button variant="outlined" color="error" onClick={() => handleDeleteTurma(turmaSelecionada)}>Excluir</Button>
                <Button variant="contained" onClick={handleCloseDetalhes}>Fechar</Button>
>>>>>>> c3ba902082a8f24951e46bcfa1dc1f75de15dc45
              </Box>
            )}
          </Box>
        </Modal>

        {/* Modal Editar */}
        <Modal open={openEditar} onClose={handleCloseEditar}>
          <Box sx={{ ...styleModal, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6">Editar Turma</Typography>
            <Input
              value={editTurma?.Nome || ""}
              placeholder="Nome"
              onChange={(e) => handleEditChange("Nome", e.target.value)}
            />
            <Input
              value={editTurma?.Serie || ""}
              placeholder="Série"
              onChange={(e) => handleEditChange("Serie", e.target.value)}
            />
            <Input
              type="number"
              value={editTurma?.AnoLetivo || ""}
              placeholder="Ano Letivo"
              onChange={(e) => handleEditChange("AnoLetivo", Number(e.target.value))}
            />
            <select
              value={editTurma?.Turno || ""}
                            onChange={(e) => handleEditChange("Turno", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1.5px solid #d1d5db",
                fontSize: "1rem",
                outline: "none",
                marginBottom: "16px",
              }}
            >
              <option value="">Selecione o turno</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
            </select>
            <Input
              value={editTurma?.Sala || ""}
              placeholder="Sala"
              onChange={(e) => handleEditChange("Sala", e.target.value)}
            />
            <Input
              type="number"
              value={editTurma?.CapacidadeMaxima || ""}
              placeholder="Capacidade Máxima"
              onChange={(e) => handleEditChange("CapacidadeMaxima", Number(e.target.value))}
            />

            <Typography sx={{ fontWeight: 600 }}>Professores por disciplina:</Typography>
            {editTurma?.disciplinas?.map((d) => (
              <Box key={d.Id} sx={{ mb: 2 }}>
                <Typography>{d.Nome}</Typography>
                <select
                  value={professoresPorDisciplina[d.Id] ?? ""}
                  onChange={(e) =>
                    setProfessoresPorDisciplina({
                      ...professoresPorDisciplina,
                      [d.Id]: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #d1d5db",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                >
                  <option value="">Selecione um professor</option>
                  {professores.map((prof) => (
<<<<<<< HEAD
                    <option
                      key={prof.Id}
                      value={prof.Id}
                      disabled={!isProfessorDisponivelNoTurno(prof.Id, editTurma?.Turno || "") && professoresPorDisciplina[d.Id] !== prof.Id}
                    >
                      {prof.Nome} {!isProfessorDisponivelNoTurno(prof.Id, editTurma?.Turno || "") && professoresPorDisciplina[d.Id] !== prof.Id ? "(Indisponível no turno)" : ""}
                    </option>
=======
                    <option key={prof.Id} value={prof.Id}>{prof.Nome}</option>
>>>>>>> c3ba902082a8f24951e46bcfa1dc1f75de15dc45
                  ))}
                </select>
              </Box>
            ))}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={handleCloseEditar}>Cancelar</Button>
              <Button variant="contained" onClick={salvarAlteracoes}>Salvar</Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal Criar */}
        <Modal open={openCriar} onClose={() => setOpenCriar(false)}>
<<<<<<< HEAD
          <Box sx={{ maxWidth: 700, width: "100%", borderRadius: 3, p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#4F46E5", mb: 3 }}>
              Criar nova turma
            </Typography>
=======
          <Box sx={{ ...styleModal, maxWidth: 600 }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: "#4F46E5" }}>Criar turma</Typography>
>>>>>>> c3ba902082a8f24951e46bcfa1dc1f75de15dc45

            {/* FORMULÁRIO */}
            <Grid>
              <Grid>
                <TextField
                  label="Nome da Turma"
                  placeholder="Ex: Turma A"
                  fullWidth
                  required
                  value={novaTurma.Nome}
                  onChange={(e) => setNovaTurma({ ...novaTurma, Nome: e.target.value })}
                />
              </Grid>

<<<<<<< HEAD
              <Grid>
                <TextField
                  select
                  label="Ano"
                  fullWidth
                  required
                  value={novaTurma.Serie}
                  onChange={(e) => setNovaTurma({ ...novaTurma, Serie: e.target.value })}
                >
                  <MenuItem value="">Selecione o ano</MenuItem>
                  <MenuItem value="1º">1º Ano</MenuItem>
                  <MenuItem value="2º">2º Ano</MenuItem>
                  <MenuItem value="3º">3º Ano</MenuItem>
                </TextField>
              </Grid>

              <Grid>
                <TextField
                  label="Ano Letivo"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ min: 2020, max: 2030 }}
                  value={novaTurma.AnoLetivo}
                  onChange={(e) => setNovaTurma({ ...novaTurma, AnoLetivo: Number(e.target.value) })}
                />
              </Grid>

              <Grid >
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
              </Grid>

              <Grid >
                <TextField
                  label="Sala"
                  placeholder="Ex: Sala 101"
                  fullWidth
                  required
                  value={novaTurma.Sala}
                  onChange={(e) => setNovaTurma({ ...novaTurma, Sala: e.target.value })}
                />
              </Grid>

              <Grid>
                <TextField
                  label="Capacidade Máxima"
                  type="number"
                  inputProps={{ min: 1, max: 100 }}
                  fullWidth
                  required
                  value={novaTurma.CapacidadeMaxima}
                  onChange={(e) =>
                    setNovaTurma({ ...novaTurma, CapacidadeMaxima: Number(e.target.value) })
                  }
                  helperText="Máximo de alunos permitidos"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* ALUNOS */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
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
                sx={{ mb: 2 }}
              />

              <Box
                sx={{
                  maxHeight: 150,
                  overflowY: "auto",
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                {filteredAlunos.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Nenhum aluno encontrado
                  </Typography>
                ) : (
                  filteredAlunos.map((a) => (
                    <Box key={a.RA} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <input
                        type="checkbox"
                        checked={isSelected(a.RA)}
                        disabled={isAlunoEmTurma(a.RA)}
                        onChange={() => toggleAluno(a)}
                        style={{ marginRight: 8 }}
                      />
                      <Typography variant="body2">
                        {a.Nome}{" "}
                        {isAlunoEmTurma(a.RA) && (
                          <span style={{ color: "red", fontSize: "0.8rem" }}>(Já em turma)</span>
                        )}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>

              <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                <Button size="small" variant="contained" onClick={selectAll}>
                  Selecionar Todos
                </Button>
                <Button size="small" variant="outlined" color="secondary" onClick={clearAll}>
                  Limpar Seleção
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* DISCIPLINAS */}
            <Box>
              <Typography fontWeight={600} mb={1}>
                Selecionar disciplinas
              </Typography>
              <Box
                sx={{
                  maxHeight: 150,
                  overflowY: "auto",
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                {disciplinas.map((d) => (
                  <Box key={d.Id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <input
                      type="checkbox"
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
                      style={{ marginRight: 8 }}
                    />
                    <Typography variant="body2">{d.Nome}</Typography>
=======
            <Typography sx={{ fontWeight: 600 }}>Selecione os alunos:</Typography>
            <Box sx={{ maxHeight: 150, overflowY: "auto", mb: 3, border: "1px solid #e5e7eb", borderRadius: 1, p: 2 }}>
              {alunos.map((a) => (
                <label key={a.RA} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAlunos.some((al) => al.RA === a.RA)}
                    onChange={() => {
                      if (selectedAlunos.some((al) => al.RA === a.RA)) {
                        setSelectedAlunos(selectedAlunos.filter((al) => al.RA !== a.RA));
                      } else {
                        setSelectedAlunos([...selectedAlunos, a]);
                      }
                    }}
                  />
                  {a.Nome}
                </label>
              ))}
            </Box>

            <Typography sx={{ fontWeight: 600 }}>Selecione as disciplinas:</Typography>
            <Box sx={{ maxHeight: 150, overflowY: "auto", mb: 3, border: "1px solid #e5e7eb", borderRadius: 1, p: 2 }}>
              {disciplinas.map((d) => (
                <label key={d.Codigo} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedDisciplinas.some((disc) => disc.Codigo === d.Codigo)}
                    onChange={() => {
                      if (selectedDisciplinas.some((disc) => disc.Codigo === d.Codigo)) {
                        setSelectedDisciplinas(selectedDisciplinas.filter((disc) => disc.Codigo !== d.Codigo));
                        const copy = { ...professoresPorDisciplina };
                        delete copy[d.Id];
                        setProfessoresPorDisciplina(copy);
                      } else {
                        setSelectedDisciplinas([...selectedDisciplinas, d]);
                      }
                    }}
                  />
                  {d.Nome}
                </label>
              ))}
            </Box>

            {selectedDisciplinas.length > 0 && (
              <>
                <Typography sx={{ fontWeight: 600 }}>Professores por disciplina:</Typography>
                {selectedDisciplinas.map((d) => (
                  <Box key={d.Id} sx={{ mb: 2 }}>
                    <Typography>{d.Nome}</Typography>
                    <select
                      value={professoresPorDisciplina[d.Id] || ""}
                      onChange={(e) =>
                        setProfessoresPorDisciplina({
                          ...professoresPorDisciplina,
                          [d.Id]: Number(e.target.value),
                        })
                      }
                    >
                      <option value="">Selecione um professor</option>
                      {professores.map((prof) => (
                        <option key={prof.Id} value={prof.Id}>{prof.Nome}</option>
                      ))}
                    </select>
>>>>>>> c3ba902082a8f24951e46bcfa1dc1f75de15dc45
                  </Box>
                ))}
              </Box>

              {/* Seleção de professores por disciplina */}
                {selectedDisciplinas.length > 0 && (
                  <>
                    <Typography sx={{ fontWeight: 600 }}>Professores por disciplina:</Typography>
                      {selectedDisciplinas.map((d) => (
                        <Box key={d.Id} sx={{ mb: 2 }}>
                          <Typography>{d.Nome}</Typography>
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
                            sx={{ mt: 1 }}
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
                      </>
                    )}

              <Button variant="contained" fullWidth onClick={criarTurma} sx={{ backgroundColor: "#4F46E5" }}>
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
<<<<<<< HEAD
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-5 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors"
          style={{ userSelect: "none" }}
        >
          <FaPlus size={20} />
=======
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-5 rounded-full shadow-xl cursor-pointer hover:bg-indigo-700 transition-transform transform hover:scale-110 flex items-center justify-center"
        >
          <FaPlus size={24} />
>>>>>>> c3ba902082a8f24951e46bcfa1dc1f75de15dc45
        </Box>
      </main>
    </div>
  );
}
