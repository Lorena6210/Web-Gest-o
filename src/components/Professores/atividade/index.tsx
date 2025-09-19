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
      <Box sx={{ p: 3, position: "relative", zIndex: 1, left: "20%" }}>
        <h1>Atividades por Turma</h1>

        {/* Tabs para separar turmas */}
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{ mb: 3 }}
        >
          {turmasOrdenadas.map((turma) => (
            <Tab key={turma.Id} label={turma.Nome} />
          ))}
        </Tabs>

        <Button
          variant="contained"
          sx={{ mb: 2 }}
          onClick={() => setOpenCriar(true)}
        >
          Nova Atividade
        </Button>

        {/* Lista de atividades da turma selecionada */}
        <ul>
          {atividades
            .filter((a) => a.turma === turmasOrdenadas[tabIndex]?.Nome)
            .map((atividade) => (
              <li
                key={atividade.id}
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => handleOpenDetalhes(atividade)}
              >
                {atividade.titulo} – Entrega:{" "}
                {new Date(atividade.dataEntrega).toLocaleString()}
              </li>
            ))}
        </ul>
      </Box>

      {/* Modal de Detalhes */}
      <Modal open={openDetalhes} onClose={handleCloseDetalhes}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 650,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {atividadeSelecionada && (
            <>
              <Typography variant="h5" gutterBottom>
                {atividadeSelecionada.titulo}
              </Typography>
              <Typography>Descrição: {atividadeSelecionada.descricao}</Typography>
              <Typography>
                Data de Criação:{" "}
                {new Date(atividadeSelecionada.dataCriacao).toLocaleString()}
              </Typography>
              <Typography>
                Data de Entrega:{" "}
                {new Date(atividadeSelecionada.dataEntrega).toLocaleString()}
              </Typography>
              <Typography>
                Data de Finalização:{" "}
                {new Date(
                  atividadeSelecionada.dataFinalizacao
                ).toLocaleString()}
              </Typography>
              <Typography>Professor: {atividadeSelecionada.professor}</Typography>
              <Typography>Turma: {atividadeSelecionada.turma}</Typography>
              <Typography>Disciplina: {atividadeSelecionada.disciplina}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Alunos da {atividadeSelecionada.turma}
              </Typography>
              <List>
                {turmas
                  .find((t) => t.Nome === atividadeSelecionada.turma)
                  ?.alunos?.map((aluno) => (
                    <ListItem key={aluno.Id}>
                      <ListItemText
                        primary={aluno.Nome}
                        secondary={`Disciplina: ${atividadeSelecionada.disciplina}`}
                      />
                      <TextField
                        type="number"
                        size="small"
                        label="Nota"
                        value={notas[aluno.Id] || ""}
                        onChange={(e) =>
                          handleNotaChange(aluno.Id, Number(e.target.value))
                        }
                        sx={{ width: "100px", ml: 2 }}
                      />
                    </ListItem>
                  ))}
              </List>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button onClick={handleCloseDetalhes} sx={{ mr: 2 }}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={handleSalvarNotas}>
                  Salvar Notas
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Modal de Criar Atividade */}
      <Modal open={openCriar} onClose={() => setOpenCriar(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Criar Nova Atividade
          </Typography>

          <TextField
            label="Título"
            fullWidth
            margin="normal"
            value={novaAtividade.titulo}
            onChange={(e) =>
              setNovaAtividade((p) => ({ ...p, titulo: e.target.value }))
            }
          />
          <TextField
            label="Descrição"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={novaAtividade.descricao}
            onChange={(e) =>
              setNovaAtividade((p) => ({ ...p, descricao: e.target.value }))
            }
          />
          <TextField
            type="datetime-local"
            label="Data de Entrega"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={novaAtividade.dataEntrega}
            onChange={(e) =>
              setNovaAtividade((p) => ({ ...p, dataEntrega: e.target.value }))
            }
          />
          <TextField
            type="datetime-local"
            label="Data de Finalização"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={novaAtividade.dataFinalizacao}
            onChange={(e) =>
              setNovaAtividade((p) => ({
                ...p,
                dataFinalizacao: e.target.value,
              }))
            }
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Turma</InputLabel>
            <Select
              value={novaAtividade.turma}
              onChange={(e) =>
                setNovaAtividade((p) => ({ ...p, turma: e.target.value }))
              }
            >
              {turmas.map((turma) => (
                <MenuItem key={turma.Id} value={turma.Nome}>
                  {turma.Nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Select de disciplinas automáticas */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Disciplina</InputLabel>
            <Select
              value={novaAtividade.disciplina}
              onChange={(e) =>
                setNovaAtividade((p) => ({ ...p, disciplina: e.target.value }))
              }
            >
              {disciplinasProfessor.map((disciplina, index) => (
                <MenuItem key={index} value={disciplina}>
                  {disciplina}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={() => setOpenCriar(false)} sx={{ mr: 2 }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleCriarAtividade}>
              Criar
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
