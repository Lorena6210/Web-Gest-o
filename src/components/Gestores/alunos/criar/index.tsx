"use client";
import React, { useEffect, useState } from "react";
import { FaPlus, FaUser, FaIdBadge, FaSchool } from "react-icons/fa";
import { fetchAlunos, createAluno, updateAluno, deleteAluno } from "@/lib/AlunoApi";
// import { TurmaCompleta } from "@/lib/TurmaApi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Navbar from "../../Navbar";
import styles from "../css/TodasAlunosPage.module.css"; // Assumindo que você tem um arquivo de estilos
// import { Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";

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
  const [searchTerm, setSearchTerm] = useState(""); // Adicionado para busca

  const [openCriar, setOpenCriar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

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

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const alunosAPI: AlunoAPI[] = await fetchAlunos();
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

          const alunosComTurma: Aluno[] = alunosAPI.map((aluno: AlunoAPI) => {
            const turmaEncontrada = turmasData.find((turma: TurmaCompleta) =>
              turma.alunos?.some((a: AlunoAPI) => a.RA === aluno.RA)
            );
            return {
              ...aluno,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
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
      setEditMode(false);
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
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
      setOpenView(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showSnackbar("Erro ao excluir aluno", "error");
    }
  };

  const alunosFiltrados = alunos.filter(
    (aluno) =>
      (aluno.Nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (aluno.RA || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (aluno.CPF || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ width: "1024px", flexDirection: "row", marginLeft: "340px", marginRight: "auto" }} className={`flex flex-col h-screen w-full ${styles["page-container"]}`}>
      <Navbar usuario={usuario} />
      <main className={styles["main-content"]}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4F46E5", mb: 1 }}>
            Gestão de Alunos
          </Typography>
          <Typography sx={{ color: "#6B7280", mb: 2 }}>Gerencie todos os alunos cadastrados no sistema</Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ background: "#fff", padding: 2, borderRadius: 2, boxShadow: 1, border: "1px solid #E5E7EB" }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.875rem" }}>Total de Alunos</Typography>
              <Typography sx={{ fontSize: "1.875rem", fontWeight: "bold", color: "#3B82F6" }}>{alunos.length}</Typography>
            </Box>
          </Box>
          <TextField
            placeholder="Buscar aluno por nome, RA ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "2px solid #E5E7EB",
              background: "#fff",
              "& .MuiOutlinedInput-root": {
                "& fieldset": { border: "none" },
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "none" },
              },
              "&:focus": { borderColor: "#3B82F6", boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.1)" },
            }}
            // InputProps={{
            //   startAdornment: <Box sx={{ position: "absolute", left: "%", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}><FaUser /></Box>,
            // }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <Box sx={{ width: 64, height: 64, border: "4px solid #D1D5DB", borderTop: "4px solid #3B82F6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <Typography sx={{ color: "#6B7280", mt: 2 }}>Carregando alunos...</Typography>
          </Box>
        ) : alunosFiltrados.length > 0 ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 3 }}>
            {alunosFiltrados.map((aluno) => (
              <Box
                key={aluno.Id}
                sx={{
                  background: "#fff",
                  borderRadius: 2,
                  p: 3,
                  boxShadow: 2,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": { boxShadow: 4, transform: "scale(1.02)", borderColor: "#3B82F6" },
                  border: "1px solid #E5E7EB",
                }}
                onClick={() => { setAlunoSelecionado(aluno); setOpenView(true); }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "1.25rem" }}>
                    {aluno.Nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: "#1F2937" }}>{aluno.Nome}</Typography>
                    <Typography sx={{ color: aluno.Status === "Ativo" ? "#10B981" : "#EF4444", fontSize: "0.875rem" }}>{aluno.Status}</Typography>
                  </Box>
                </Box>
                <Typography sx={{ display: "flex", alignItems: "center", gap: 1, color: "#6B7280" }}><FaIdBadge /> RA: <span sx={{ fontWeight: "bold", color: "#1F2937" }}>{aluno.RA}</span></Typography>
                <Typography sx={{ display: "flex", alignItems: "center", gap: 1, color: "#6B7280" }}><FaIdBadge /> CPF: {aluno.CPF}</Typography>
                <Typography sx={{ display: "flex", alignItems: "center", gap: 1, color: "#6B7280" }}><FaSchool /> Turma: {turmas.find(t => t.Id === aluno.TurmaId)?.turma.Nome || "Sem turma"}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", p: 4, background: "#fff", borderRadius: 2, boxShadow: 1 }}>
            <FaSchool sx={{ fontSize: "48px", color: "#9CA3AF", mb: 2 }} />
            <Typography sx={{ fontWeight: "bold", color: "#1F2937" }}>Nenhum aluno encontrado</Typography>
            <Typography sx={{ color: "#6B7280" }}>Tente buscar com outros termos</Typography>
          </Box>
        )}

        {/* Modal Criar */}
        <Modal open={openCriar} onClose={() => setOpenCriar(false)}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff", p: 4, borderRadius: 3, maxWidth: 600, width: "90%", maxHeight: "90vh", overflowY: "auto", boxShadow: 5 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4F46E5", mb: 3 }}>Cadastrar Novo Aluno</Typography>
            <Box component="form" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
              <TextField label="Nome Completo" value={novoAluno.Nome} onChange={(e) => setNovoAluno({ ...novoAluno, Nome: e.target.value })} required fullWidth />
              <TextField label="RA" value={novoAluno.RA} onChange={(e) => setNovoAluno({ ...novoAluno, RA: e.target.value })} required fullWidth />
              <TextField label="CPF" value={novoAluno.CPF} onChange={(e) => setNovoAluno({ ...novoAluno, CPF: e.target.value })} required fullWidth />
              <TextField label="Telefone" value={novoAluno.Telefone} onChange={(e) => setNovoAluno({ ...novoAluno, Telefone: e.target.value })} required fullWidth />
              <TextField label="Data de Nascimento" type="date" value={novoAluno.DataNascimento} onChange={(e) => setNovoAluno({ ...novoAluno, DataNascimento: e.target.value })} required fullWidth InputLabelProps={{ shrink: true }} />
              <FormControl fullWidth required>
                <InputLabel>Gênero</InputLabel>
                <Select value={novoAluno.Genero} onChange={(e) => setNovoAluno({ ...novoAluno, Genero: e.target.value })}>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Feminino">Feminino</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Turma</InputLabel>
                <Select value={novoAluno.TurmaId || ""} onChange={(e) => setNovoAluno({ ...novoAluno, TurmaId: e.target.value ? Number(e.target.value) : undefined })}>
                  <MenuItem value="">Sem turma</MenuItem>
                  {turmas.map((turma) => (
                    <MenuItem key={turma.Id} value={turma.Id}>{turma.turma.Nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Senha" type="password" value={novoAluno.Senha} onChange={(e) => setNovoAluno({ ...novoAluno, Senha: e.target.value })} required fullWidth />
            </Box>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={() => setOpenCriar(false)}>Cancelar</Button>
              <Button variant="contained" onClick={salvarNovoAluno}>Cadastrar Aluno</Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal View */}
        <Modal open={openView} onClose={() => setOpenView(false)}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff", borderRadius: 3, maxWidth: 600, width: "90%", boxShadow: 5 }}>
            <Box sx={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)", p: 3, borderRadius: "12px 12px 0 0", color: "#fff" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.25rem" }}>
                    {alunoSelecionado?.Nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>{alunoSelecionado?.Nome}</Typography>
                    <Typography>RA: {alunoSelecionado?.RA}</Typography>
                  </Box>
                </Box>
                <Button onClick={() => setOpenView(false)} sx={{ color: "#fff" }}>X</Button>
              </Box>
            </Box>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                <Box sx={{ background: "#F9FAFB", p: 2, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>CPF</Typography>
                  <Typography sx={{ fontWeight: "medium", color: "#1F2937" }}>{alunoSelecionado?.CPF}</Typography>
                </Box>
                <Box sx={{ background: "#F9FAFB", p: 2, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Telefone</Typography>
                  <Typography sx={{ fontWeight: "medium", color: "#1F2937" }}>{alunoSelecionado?.Telefone}</Typography>
                </Box>
                <Box sx={{ background: "#F9FAFB", p: 2, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Data de Nascimento</Typography>
                  <Typography sx={{ fontWeight: "medium", color: "#1F2937" }}>{alunoSelecionado?.DataNascimento ? new Date(alunoSelecionado.DataNascimento).toLocaleDateString('pt-BR') : ''}</Typography>
                </Box>
                <Box sx={{ background: "#F9FAFB", p: 2, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Gênero</Typography>
                  <Typography sx={{ fontWeight: "medium", color: "#1F2937" }}>{alunoSelecionado?.Genero}</Typography>
                </Box>
                <Box sx={{ background: "#F9FAFB", p: 2, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Turma</Typography>
                  <Typography sx={{ fontWeight: "medium", color: "#1F2937" }}>{turmas.find(t => t.Id === alunoSelecionado?.TurmaId)?.turma.Nome || "Sem turma"}</Typography>
                </Box>
                <Box sx={{ background: "#F9FAFB", p: 2, borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>Status</Typography>
                  <Typography sx={{ fontWeight: "medium", color: alunoSelecionado?.Status === "Ativo" ? "#10B981" : "#EF4444" }}>{alunoSelecionado?.Status}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 2, borderTop: "1px solid #E5E7EB" }}>
                <Button variant="outlined" color="error" onClick={() => excluirAluno(alunoSelecionado?.Id)}>Excluir</Button>
                <Button variant="contained" onClick={() => { setOpenView(false); setOpenEditar(true); setEditMode(true); }}>Editar Aluno</Button>
              </Box>
            </Box>
          </Box>
        </Modal>

        {/* Modal Editar */}
        <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff", p: 4, borderRadius: 3, maxWidth: 600, width: "90%", maxHeight: "90vh", overflowY: "auto", boxShadow: 5 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4F46E5", mb: 3 }}>Editar Aluno</Typography>
            {alunoSelecionado && (
              <Box component="form" sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                <TextField label="Nome Completo" value={alunoSelecionado.Nome} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, Nome: e.target.value })} required fullWidth />
                <TextField label="RA" value={alunoSelecionado.RA} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, RA: e.target.value })} required fullWidth />
                <TextField label="CPF" value={alunoSelecionado.CPF} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, CPF: e.target.value })} required fullWidth />
                <TextField label="Telefone" value={alunoSelecionado.Telefone} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, Telefone: e.target.value })} required fullWidth />
                <TextField label="Data de Nascimento" type="date" value={alunoSelecionado.DataNascimento} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, DataNascimento: e.target.value })} required fullWidth InputLabelProps={{ shrink: true }} />
                <FormControl fullWidth required>
                  <InputLabel>Gênero</InputLabel>
                  <Select value={alunoSelecionado.Genero} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, Genero: e.target.value })}>
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Feminino">Feminino</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Turma</InputLabel>
                  <Select value={alunoSelecionado.TurmaId || ""} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, TurmaId: e.target.value ? Number(e.target.value) : undefined })}>
                    <MenuItem value="">Sem turma</MenuItem>
                    {turmas.map((turma) => (
                      <MenuItem key={turma.Id} value={turma.Id}>{turma.turma.Nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Senha" type="password" value={alunoSelecionado.Senha} onChange={(e) => setAlunoSelecionado({ ...alunoSelecionado, Senha: e.target.value })} required fullWidth />
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={() => setOpenEditar(false)}>Cancelar</Button>
              <Button variant="contained" onClick={salvarEdicao}>Salvar Alterações</Button>
            </Box>
          </Box>
        </Modal>

        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
          <MuiAlert severity={snackbarSeverity}>{snackbarMessage}</MuiAlert>
        </Snackbar>

        <Box onClick={() => setOpenCriar(true)} sx={{ position: "fixed", bottom: 24, right: 24, background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: 3, cursor: "pointer" }}>
          <FaPlus size={20} color="#fff" />
        </Box>
      </main>
    </div>
  );
}
