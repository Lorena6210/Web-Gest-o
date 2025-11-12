import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { TurmaCompleta } from "@/Types/Turma";
import {
  Box,
  Modal,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
} from "@mui/material";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface AtividadeDetalhada {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataEntrega: string;
  dataFinalizacao: string;
  professor: string;
  turma: string;
  disciplina: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  atividades: AtividadeDetalhada[];
}

export default function ProfessorAtividadePageComponentI({
  usuario,
  turmas,
  atividades: atividadesIniciais,
}: Props) {
  const [tabIndex, setTabIndex] = useState(0);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [openCriar, setOpenCriar] = useState(false);
  const [atividadeSelecionada, setAtividadeSelecionada] =
    useState<AtividadeDetalhada | null>(null);
  const [atividades, setAtividades] = useState(atividadesIniciais);
  const [notas, setNotas] = useState<{ [alunoId: number]: number }>({});

  // formulário de criação
  const [novaAtividade, setNovaAtividade] = useState({
    titulo: "",
    descricao: "",
    dataEntrega: "",
    dataFinalizacao: "",
    turma: "",
    disciplina: "",
  });

  // pegar disciplinas do professor logado
  const [disciplinasProfessor, setDisciplinasProfessor] = useState<string[]>([]);

  useEffect(() => {
    const prof = turmas
      .flatMap((t) => t.professores || [])
      .find((p) => p.Nome === usuario.Nome);

    if (prof) {
      const lista = prof.Disciplinas.split(",").map((d) => d.trim());
      setDisciplinasProfessor(lista);

      // se o professor só tiver uma disciplina, já preenche
      if (lista.length === 1) {
        setNovaAtividade((p) => ({ ...p, disciplina: lista[0] }));
      }
    }
  }, [usuario, turmas]);

  const handleOpenDetalhes = (atividade: AtividadeDetalhada) => {
    setAtividadeSelecionada(atividade);
    setOpenDetalhes(true);
  };

  const handleCloseDetalhes = () => {
    setOpenDetalhes(false);
    setAtividadeSelecionada(null);
    setNotas({});
  };

  const handleNotaChange = (alunoId: number, nota: number) => {
    setNotas((prev) => ({
      ...prev,
      [alunoId]: nota,
    }));
  };

  const handleSalvarNotas = async () => {
    if (!atividadeSelecionada) return;
    try {
      await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          atividadeId: atividadeSelecionada.id,
          turma: atividadeSelecionada.turma,
          disciplina: atividadeSelecionada.disciplina,
          notas,
        }),
      });

      console.log("Notas salvas:", notas);
      handleCloseDetalhes();
    } catch (err) {
      console.error("Erro ao salvar notas", err);
    }
  };

  const handleCriarAtividade = async () => {
    try {
      const nova = {
        ...novaAtividade,
        professor: usuario.Nome,
        dataCriacao: new Date().toISOString(),
      };

      const res = await fetch("/api/atividades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nova),
      });

      const criada: AtividadeDetalhada = await res.json();
      setAtividades((prev) => [...prev, criada]);
      setOpenCriar(false);
      setNovaAtividade({
        titulo: "",
        descricao: "",
        dataEntrega: "",
        dataFinalizacao: "",
        turma: "",
        disciplina: disciplinasProfessor.length === 1 ? disciplinasProfessor[0] : "",
      });
    } catch (err) {
      console.error("Erro ao criar atividade", err);
    }
  };

  const turmasOrdenadas = turmas.sort((a, b) =>
    a.Nome.localeCompare(b.Nome)
  );

  return (
    <div>
      <Navbar usuario={usuario} />
      <Box
        sx={{
          p: 3,
          position: "relative",
          left: "320px",
          maxWidth: "1024px",
          minHeight: "100vh",
          // bgcolor: "#f3f4f6",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 700,
            color: "#4f46e5",
            textAlign: "center",
          }}
        >
          Atividades por Turma
        </Typography>

        {/* Tabs para separar turmas */}
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{
            mb: 3,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, color: "#374151" },
            "& .Mui-selected": { color: "#4f46e5" },
            "& .MuiTabs-indicator": { bgcolor: "#4f46e5" },
          }}
        >
          {turmasOrdenadas.map((turma) => (
            <Tab key={turma.Id} label={turma.Nome} />
          ))}
        </Tabs>

        {/* Botão de adicionar atividade */}
        <Button
          variant="contained"
          sx={{
            mb: 3,
            bgcolor: "#4f46e5",
            "&:hover": { bgcolor: "#4338ca" },
            borderRadius: 2,
            py: 1.5,
            px: 3,
            fontWeight: 600,
            boxShadow: 3,
          }}
          onClick={() => setOpenCriar(true)}
        >
          Adicionar Atividade
        </Button>

        {/* Lista de atividades em cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {atividades
            .filter((a) => a.turma === turmasOrdenadas[tabIndex]?.Nome)
            .map((atividade) => (
              <Box
                key={atividade.id}
                onClick={() => handleOpenDetalhes(atividade)}
                sx={{
                  flex: "1 1 calc(45% - 16px)",
                  bgcolor: "#fff",
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#4f46e5", mb: 1 }}>
                  {atividade.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Entrega: {new Date(atividade.dataEntrega).toLocaleString()}
                </Typography>
              </Box>
            ))}
          {atividades.filter((a) => a.turma === turmasOrdenadas[tabIndex]?.Nome).length === 0 && (
            <Typography sx={{ color: "#6b7280" }}>Nenhuma atividade encontrada.</Typography>
          )}
        </Box>

        {/* Modal de Detalhes */}
        <Modal open={openDetalhes} onClose={handleCloseDetalhes}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 650 },
              bgcolor: "#ffffff",
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
            }}
          >
            {atividadeSelecionada && (
              <>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: "#4f46e5" }}>
                  {atividadeSelecionada.titulo}
                </Typography>
                <Typography sx={{ mb: 1 }}>Descrição: {atividadeSelecionada.descricao}</Typography>
                <Typography sx={{ mb: 1 }}>
                  Data de Criação: {new Date(atividadeSelecionada.dataCriacao).toLocaleString()}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Data de Entrega: {new Date(atividadeSelecionada.dataEntrega).toLocaleString()}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  Data de Finalização: {new Date(atividadeSelecionada.dataFinalizacao).toLocaleString()}
                </Typography>
                <Typography sx={{ mb: 1 }}>Professor: {atividadeSelecionada.professor}</Typography>
                <Typography sx={{ mb: 2 }}>Turma: {atividadeSelecionada.turma}</Typography>

                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Alunos da {atividadeSelecionada.turma}
                </Typography>
                <List sx={{ maxHeight: 250, overflow: "auto", bgcolor: "#f3f4f6", borderRadius: 2, p: 1 }}>
                  {turmas
                    .find((t) => t.Nome === atividadeSelecionada.turma)
                    ?.alunos?.map((aluno) => (
                      <ListItem
                        key={aluno.Id}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: "#fff",
                          boxShadow: 1,
                          transition: "all 0.2s",
                          "&:hover": { transform: "translateY(-1px)", boxShadow: 4 },
                          opacity: aluno.Status === "Desativado" ? 0.5 : 1,
                        }}
                      >
                        <ListItemText
                          primary={aluno.Nome}
                          secondary={`Disciplina: ${atividadeSelecionada.disciplina}`}
                        />
                        <TextField
                          type="number"
                          size="small"
                          label="Nota"
                          value={notas[aluno.Id] || ""}
                          onChange={(e) => handleNotaChange(aluno.Id, Number(e.target.value))}
                          sx={{ width: "100px", ml: 2 }}
                        />
                      </ListItem>
                    ))}
                </List>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                  <Button onClick={handleCloseDetalhes} sx={{ mr: 2 }}>
                    Cancelar
                  </Button>
                  <Button variant="contained" sx={{ bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }} onClick={handleSalvarNotas}>
                    Salvar Notas
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </div>
  );
}
