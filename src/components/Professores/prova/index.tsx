import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Button,
  Modal,
  TextField,
  MenuItem
} from "@mui/material";
import Navbar from "../Navbar";

interface Prova {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataEntrega: string;
  idBimestre: number;
  nomeBimestre: string;
  professor: string;
  turma: string;
  disciplina: string;
}

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  provas: Prova[];
  turmas?: string[]; // nomes das turmas
  disciplinas?: string[]; // nomes das disciplinas
}

export default function ListaDeProvas({ usuario, provas, turmas, disciplinas }: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [novaProva, setNovaProva] = useState({
    titulo: "",
    descricao: "",
    dataEntrega: "",
    turma: "",
    disciplina: "",
  });

  const provasDoProfessor = provas.filter(p => p.professor === usuario.Nome);

  const provasPorBimestre = provasDoProfessor.reduce((acc, prova) => {
    if (!acc[prova.nomeBimestre]) acc[prova.nomeBimestre] = [];
    acc[prova.nomeBimestre].push(prova);
    return acc;
  }, {} as Record<string, Prova[]>);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNovaProva({ ...novaProva, [e.target.name]: e.target.value });
  };

  const handleSalvarProva = () => {
    console.log("Criar prova:", novaProva);
    setOpenModal(false);
  };

  return (
    <Box>
      <Navbar usuario={usuario} />

      <Box sx={{ mt: 3, ml: "320px", pr: "40px", maxWidth: "1024px" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ mb: 3, fontWeight: 700, color: "#4f46e5" }}
        >
          Provas do Professor {usuario?.Nome}
        </Typography>

        <Button
          variant="contained"
          sx={{
            mb: 3,
            bgcolor: "#4f46e5",
            "&:hover": { bgcolor: "#4338ca" },
            borderRadius: 2,
            py: 1.2,
            fontWeight: 600,
          }}
          onClick={() => setOpenModal(true)}
        >
          Criar Prova
        </Button>

        {Object.entries(provasPorBimestre).map(([bimestre, provasDoBimestre]) => (
          <Paper
            key={bimestre}
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              boxShadow: 4,
              bgcolor: "#ffffff",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": { transform: "translateY(-3px)", boxShadow: 8 },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#4f46e5" }}>
              {bimestre}
            </Typography>
            <Divider sx={{ my: 2, borderColor: "#e5e7eb" }} />

            {Object.entries(
              provasDoBimestre.reduce((acc, prova) => {
                if (!acc[prova.disciplina]) acc[prova.disciplina] = [];
                acc[prova.disciplina].push(prova);
                return acc;
              }, {} as Record<string, Prova[]>)
            ).map(([disciplina, provasDaDisciplina]) => (
              <Box key={disciplina} sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1, fontWeight: 600, color: "#374151" }}
                >
                  Disciplina: {disciplina}
                </Typography>

                <Table
                  size="small"
                  sx={{
                    "& th": {
                      bgcolor: "#f3f4f6",
                      fontWeight: 700,
                      color: "#4f46e5",
                    },
                    "& td": { color: "#374151" },
                    borderRadius: 2,
                    overflow: "hidden",
                    mb: 1,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Turma</TableCell>
                      <TableCell>Data da Prova</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {provasDaDisciplina.map(prova => (
                      <TableRow
                        key={prova.id}
                        sx={{
                          "&:hover": { bgcolor: "#f9fafb" },
                          transition: "background 0.2s",
                        }}
                      >
                        <TableCell>{prova.titulo}</TableCell>
                        <TableCell>{prova.descricao}</TableCell>
                        <TableCell>{prova.turma}</TableCell>
                        <TableCell>
                          {new Date(prova.dataEntrega).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ))}
          </Paper>
        ))}

        {/* Modal de criação */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box
            sx={{
              width: 450,
              p: 4,
              backgroundColor: "#ffffff",
              mx: "auto",
              mt: "10%",
              borderRadius: 3,
              boxShadow: 8,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#4f46e5" }}>
              Criar Nova Prova
            </Typography>

            <TextField
              label="Título"
              name="titulo"
              fullWidth
              sx={{ mt: 2 }}
              value={novaProva.titulo}
              onChange={handleChange}
            />
            <TextField
              label="Descrição"
              name="descricao"
              fullWidth
              sx={{ mt: 2 }}
              value={novaProva.descricao}
              onChange={handleChange}
            />
            <TextField
              label="Data de Entrega"
              name="dataEntrega"
              type="date"
              fullWidth
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              value={novaProva.dataEntrega}
              onChange={handleChange}
            />
            <TextField
              select
              label="Turma"
              name="turma"
              fullWidth
              sx={{ mt: 2 }}
              value={novaProva.turma}
              onChange={handleChange}
            >
              {turmas?.map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Disciplina"
              name="disciplina"
              fullWidth
              sx={{ mt: 2 }}
              value={novaProva.disciplina}
              onChange={handleChange}
            >
              {disciplinas?.map(d => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              sx={{
                mt: 3,
                bgcolor: "#4f46e5",
                "&:hover": { bgcolor: "#4338ca" },
                borderRadius: 2,
                py: 1.2,
                fontWeight: 600,
              }}
              onClick={handleSalvarProva}
            >
              Salvar
            </Button>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}
