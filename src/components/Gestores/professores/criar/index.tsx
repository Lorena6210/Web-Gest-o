"use client";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  fetchProfessores,
  fetchCreateProfessor,
  fetchUpdateProfessor,
  fetchDeleteProfessor,
} from "@/lib/ProfessorApi";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Input from "@mui/material/Input";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import {
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import Navbar from "../../Navbar";
import { TurmaCompleta } from "@/Types/Turma";
import styles from "../css/TodosProfessoresPage.module.css";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
  Email: string;
  Senha: string;
}

interface ProfessorCriar {
  Nome: string;
  Email: string;
  CPF: string;
  Senha: string;
  Telefone: string | null;
  DataNascimento: string | null;
  Genero: string | null;
  FotoPerfil: string | null;
  FormacaoAcademica: string | null;
  Status: string;
  Disciplina: string | null;
}

export interface ProfessorDataBasica {
  professor: {
    id: number;
    nome: string;
    email: string;
    senha: string;
    disciplina?: string | null;
    genero?: string | null;
    status?: string;
    fotoPerfil?: string | null;
  };
  turmas: TurmaCompleta[];
}

interface ProfessorRaw {
  Id: number;
  Nome: string;
  Email: string;
  Senha: string;
  Turmas: TurmaCompleta[];
  Disciplina?: string;
  Genero?: string;
  Status?: string;
  FotoPerfil?: string;
}

export default function TodosProfessoresPage({ usuario }: { usuario: Usuario }) {
  const [professores, setProfessores] = useState<ProfessorDataBasica[]>([]);
  const [loading, setLoading] = useState(true);
  const [turmas, setTurmas] = useState<TurmaCompleta[]>([]);

  const [novoProfessor, setNovoProfessor] = useState<ProfessorDataBasica>({
    professor: {
      id: 0,
      nome: "",
      email: "",
      senha: "",
      disciplina: "",
      genero: "Masculino",
      status: "Ativo",
    },
    turmas: [],
  });

  const [openCriar, setOpenCriar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState<ProfessorDataBasica | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Carregar professores e turmas gerais
useEffect(() => {
  const carregar = async () => {
    try {
      const professoresRaw: ProfessorRaw[] = await fetchProfessores(); // seus professores
      const response = await fetch("http://localhost:3001/turmas/");
      const dados = await response.json();

      if (!dados.success || !Array.isArray(dados.turmas)) {
        showSnackbar("Erro ao carregar turmas", "error");
        return;
      }

      const todasTurmas: TurmaCompleta[] = dados.turmas;

      // Normaliza os professores e já vincula as turmas em que estão
      const normalizados: ProfessorDataBasica[] = professoresRaw.map((prof) => {
      const turmasDoProfessor = todasTurmas.filter((t) =>
        t.professores && t.professores.some((p) => p.Id === prof.Id)
      );

        return {
          professor: {
            id: prof.Id,
            nome: prof.Nome,
            email: prof.Email,
            senha: prof.Senha ?? "",
            disciplina: prof.Disciplina ?? "",
            genero: prof.Genero ?? "Masculino",
            status: prof.Status ?? "Ativo",
          },
          turmas: turmasDoProfessor,
        };
      });

      setTurmas(todasTurmas); // se precisar para editar
      setProfessores(normalizados);
      setLoading(false);
    } catch (err) {
      console.error(err);
      showSnackbar("Erro ao carregar professores", "error");
    }
  };

  carregar();
}, []);


  // Função para carregar turmas específicas do professor ao abrir modal
const abrirModalProfessor = async (prof: ProfessorDataBasica) => {
  try {
    const response = await fetch("http://localhost:3001/turmas/");
    const dados = await response.json();

    if (!dados.success || !Array.isArray(dados.turmas)) {
      showSnackbar("Erro ao carregar turmas", "error");
      return;
    }

    const todasTurmas: TurmaCompleta[] = dados.turmas;

    // Filtra apenas as turmas em que o professor está
    const turmasDoProfessor = todasTurmas.filter((t) =>
      t.professores && t.professores.some((p) => p.Id === prof.professor.id)
    );

    setProfessorSelecionado({ ...prof, turmas: turmasDoProfessor });
  } catch (err) {
    console.error(err);
    setProfessorSelecionado({ ...prof, turmas: [] });
  }
};

  const salvarNovoProfessor = async () => {
    try {
      const payload: ProfessorCriar & { TurmasIds?: number[] } = {
        Nome: novoProfessor.professor.nome,
        Email: novoProfessor.professor.email,
        CPF: "00000000000",
        Senha: novoProfessor.professor.senha,
        Telefone: null,
        DataNascimento: null,
        Genero: novoProfessor.professor.genero ?? "Masculino",
        FotoPerfil: null,
        FormacaoAcademica: null,
        Status: novoProfessor.professor.status ?? "Ativo",
        Disciplina: novoProfessor.professor.disciplina ?? null,
      };

      const criado = await fetchCreateProfessor(payload);

      const novoNormalizado: ProfessorDataBasica = {
        professor: {
          id: criado.Id,
          nome: criado.Nome,
          email: criado.Email,
          senha: criado.Senha,
          disciplina: criado.Disciplina ?? "",
          genero: criado.Genero ?? "Masculino",
          status: criado.Status ?? "Ativo",
        },
        turmas: [],
      };

      setProfessores((prev) => [...prev, novoNormalizado]);
      showSnackbar("Professor cadastrado com sucesso!", "success");
      setOpenCriar(false);

      setNovoProfessor({
        professor: { id: 0, nome: "", email: "", senha: "", disciplina: "", genero: "Masculino", status: "Ativo" },
        turmas: [],
      });
    } catch {
      showSnackbar("Erro ao cadastrar professor", "error");
    }
  };

  const salvarEdicao = async () => {
    if (!professorSelecionado) return;
    try {
      const payload = {
        ...professorSelecionado.professor,
        TurmasIds: professorSelecionado.turmas.map(t => t.Id),
      };

      const atualizadoRaw = await fetchUpdateProfessor(payload);
      const atualizado: ProfessorDataBasica = {
        professor: {
          id: atualizadoRaw.Id ?? professorSelecionado.professor.id,
          nome: atualizadoRaw.Nome ?? professorSelecionado.professor.nome,
          email: atualizadoRaw.Email ?? professorSelecionado.professor.email,
          senha: atualizadoRaw.Senha ?? professorSelecionado.professor.senha,
          disciplina: atualizadoRaw.Disciplina ?? professorSelecionado.professor.disciplina,
          genero: atualizadoRaw.Genero ?? professorSelecionado.professor.genero,
          status: atualizadoRaw.Status ?? professorSelecionado.professor.status,
        },
        turmas: atualizadoRaw.Turmas ?? professorSelecionado.turmas ?? [],
      };

      setProfessores((prev) =>
        prev.map((p) => (p.professor.id === atualizado.professor.id ? atualizado : p))
      );

      showSnackbar("Professor atualizado com sucesso!", "success");
      setOpenEditar(false);
      setProfessorSelecionado(null);
    } catch (err) {
      console.error(err);
      showSnackbar("Erro ao atualizar professor", "error");
    }
  };

  const excluirProfessor = async (id: number) => {
    if (!window.confirm("Deseja realmente excluir este professor?")) return;
    try {
      await fetchDeleteProfessor(id);
      setProfessores((prev) => prev.filter((p) => p.professor.id !== id));
      showSnackbar("Professor excluído com sucesso!", "success");
      setProfessorSelecionado(null);
    } catch {
      showSnackbar("Erro ao excluir professor", "error");
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full ${styles["page-container"]}`}>
      <Navbar usuario={usuario} />
      <main
        className={`flex-1 overflow-y-auto p-6 max-w-[1024px] mx-auto w-full ${styles["main-content"]}`}
      >
        <h1 className={styles["page-title"]}>Todos os Professores</h1>
        {loading ? (
          <p>Carregando professores...</p>
        ) : professores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professores.map((prof) => (
              <div
                key={prof.professor.id}
                className={`${styles["professor-card"]} cursor-pointer`}
                onClick={() => abrirModalProfessor(prof)}
              >
                <h2 className={styles["professor-name"]}>{prof.professor.nome}</h2>
                <p className={styles["professor-email"]}>{prof.professor.email}</p>
                <p className={styles["professor-disciplina"]}>{prof.professor.disciplina}</p>
                <p className={styles["professor-status"]}>{prof.professor.status}</p>

                <Typography sx={{ mt: 2, fontWeight: "bold" }}>Turmas:</Typography>
                {prof.turmas && prof.turmas.length > 0 ? (
                  <ul className={styles["turmas-list"]}>
                    {prof.turmas.map((t) => (
                      <li key={t.Id}>{t.Nome}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography sx={{ fontStyle: "italic", color: "gray", mt: 1 }}>
                    Nenhuma turma vinculada
                  </Typography>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum professor encontrado.</p>
        )}
        {/* Modal Visualizar / Editar */}
   <Modal open={!!professorSelecionado} onClose={() => setProfessorSelecionado(null)}>
          <Box className={styles["modal-box"]}>
            {professorSelecionado && (
              <>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Detalhes do Professor
                </Typography>
                <p><strong>Nome:</strong> {professorSelecionado.professor.nome}</p>
                <p><strong>Email:</strong> {professorSelecionado.professor.email}</p>
                <p><strong>Disciplina:</strong> {professorSelecionado.professor.disciplina}</p>
                <p><strong>Status:</strong> {professorSelecionado.professor.status}</p>
                <p><strong>Gênero:</strong> {professorSelecionado.professor.genero}</p>

                <Typography sx={{ mt: 2, fontWeight: "bold" }}>Turmas:</Typography>
                {professorSelecionado.turmas && professorSelecionado.turmas.length > 0 ? (
                  <ul className={styles["turmas-list"]}>
                    {professorSelecionado.turmas.map((t) => (
                      <li key={t.Id}>{t.Nome}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography sx={{ fontStyle: "italic", color: "gray", mt: 1 }}>
                    Nenhuma turma vinculada
                  </Typography>
                )}     
                <Box className={styles["modal-buttons"]} sx={{ mt: 2 }}>
                  <Button
                    className={styles["btn-danger"]}
                    onClick={() => excluirProfessor(professorSelecionado.professor.id)}
                  >
                    Excluir
                  </Button>
                  <Button
                    className={styles["btn-primary"]}
                    onClick={() => setOpenEditar(true)}
                  >
                    Editar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Modal Editar */}
        <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
          <Box className={styles["modal-box"]}>
            {professorSelecionado && (
              <>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Editar Professor
                </Typography>
                <Input
                  className={styles["modal-input"]}
                  value={professorSelecionado.professor.nome}
                  onChange={(e) =>
                    setProfessorSelecionado({ ...professorSelecionado, professor: { ...professorSelecionado.professor, nome: e.target.value } })
                  }
                />
                <Input
                  className={styles["modal-input"]}
                  value={professorSelecionado.professor.email}
                  onChange={(e) =>
                    setProfessorSelecionado({ ...professorSelecionado, professor: { ...professorSelecionado.professor, email: e.target.value } })
                  }
                />
                <Input
                  className={styles["modal-input"]}
                  type="password"
                  value={professorSelecionado.professor.senha}
                  onChange={(e) =>
                    setProfessorSelecionado({ ...professorSelecionado, professor: { ...professorSelecionado.professor, senha: e.target.value } })
                  }
                />
                <Input
                  className={styles["modal-input"]}
                  placeholder="Disciplina"
                  value={professorSelecionado.professor.disciplina}
                  onChange={(e) =>
                    setProfessorSelecionado({ ...professorSelecionado, professor: { ...professorSelecionado.professor, disciplina: e.target.value } })
                  }
                />

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <FormLabel>Turmas</FormLabel>
                  <select
                    multiple
                    value={professorSelecionado.turmas.map(t => t.Id.toString())}
                    onChange={(e) => {
                      const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));
                      const selectedTurmas = turmas.filter(t => selectedIds.includes(t.Id));
                      setProfessorSelecionado({ ...professorSelecionado, turmas: selectedTurmas });
                    }}
                  >
                    {turmas.map((turma) => (
                      <option key={turma.Id} value={turma.Id}>
                        {turma.Nome}
                      </option>
                    ))}
                  </select>
                </FormControl>

                <FormControl component="fieldset" sx={{ mt: 2 }}>
                  <FormLabel>Status</FormLabel>
                  <RadioGroup
                    row
                    value={professorSelecionado.professor.status}
                    onChange={(e) =>
                      setProfessorSelecionado({ ...professorSelecionado, professor: { ...professorSelecionado.professor, status: e.target.value } })
                    }
                  >
                    <FormControlLabel value="Ativo" control={<Radio />} label="Ativo" />
                    <FormControlLabel value="Desativado" control={<Radio />} label="Desativado" />
                  </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" sx={{ mt: 2 }}>
                  <FormLabel>Gênero</FormLabel>
                  <RadioGroup
                    row
                    value={professorSelecionado.professor.genero}
                    onChange={(e) =>
                      setProfessorSelecionado({ ...professorSelecionado, professor: { ...professorSelecionado.professor, genero: e.target.value } })
                    }
                  >
                    <FormControlLabel value="Masculino" control={<Radio />} label="Masculino" />
                    <FormControlLabel value="Feminino" control={<Radio />} label="Feminino" />
                  </RadioGroup>
                </FormControl>

                <Box className={styles["modal-buttons"]} sx={{ mt: 2 }}>
                  <Button className={styles["btn-primary"]} onClick={salvarEdicao}>
                    Salvar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Modal Criar */}
        <Modal open={openCriar} onClose={() => setOpenCriar(false)}>
          <Box className={styles["modal-box"]}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Cadastrar Professor
            </Typography>
            <Input
              className={styles["modal-input"]}
              placeholder="Nome"
              value={novoProfessor.professor.nome}
              onChange={(e) =>
                setNovoProfessor({ ...novoProfessor, professor: { ...novoProfessor.professor, nome: e.target.value } })
              }
            />
            <Input
              className={styles["modal-input"]}
              placeholder="Email"
              value={novoProfessor.professor.email}
              onChange={(e) =>
                setNovoProfessor({ ...novoProfessor, professor: { ...novoProfessor.professor, email: e.target.value } })
              }
            />
            <Input
              className={styles["modal-input"]}
              placeholder="Senha"
              type="password"
              value={novoProfessor.professor.senha}
              onChange={(e) =>
                setNovoProfessor({ ...novoProfessor, professor: { ...novoProfessor.professor, senha: e.target.value } })
              }
            />
            <Input
              className={styles["modal-input"]}
              placeholder="Disciplina"
              value={novoProfessor.professor.disciplina}
              onChange={(e) =>
                setNovoProfessor({ ...novoProfessor, professor: { ...novoProfessor.professor, disciplina: e.target.value } })
              }
            />

            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel>Status</FormLabel>
              <RadioGroup
                row
                value={novoProfessor.professor.status}
                onChange={(e) =>
                  setNovoProfessor({ ...novoProfessor, professor: { ...novoProfessor.professor, status: e.target.value } })
                }
              >
                <FormControlLabel value="Ativo" control={<Radio />} label="Ativo" />
                <FormControlLabel value="Desativado" control={<Radio />} label="Desativado" />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel>Gênero</FormLabel>
              <RadioGroup
                row
                value={novoProfessor.professor.genero}
                onChange={(e) =>
                  setNovoProfessor({ ...novoProfessor, professor: { ...novoProfessor.professor, genero: e.target.value } })
                }
              >
                <FormControlLabel value="Masculino" control={<Radio />} label="Masculino" />
                <FormControlLabel value="Feminino" control={<Radio />} label="Feminino" />
              </RadioGroup>
            </FormControl>

            <Box className={styles["modal-buttons"]} sx={{ mt: 2 }}>
              <Button className={styles["btn-primary"]} onClick={salvarNovoProfessor}>
                Salvar
              </Button>
            </Box>
          </Box>
        </Modal>
      </main>
    </div>
  );
}
