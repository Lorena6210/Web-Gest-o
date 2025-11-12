// components/Aluno/AlunoView.tsx
import { TurmaCompleta } from "@/Types/Turma";
import { NotaProva } from "@/lib/provaApi";
import { Prova } from "@/pages/aluno/[id]";
import Navbar from "../Navbar";
import { Box } from "@mui/material"
import { Typography } from "@mui/material"


interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provas: Prova[];
  notas: NotaProva[];
}

export default function AlunoViewComponent({ usuario, turmas, provas, notas }: Props) {
  

  return (
<Box>
  <Navbar usuario={usuario} turmas={turmas} />

  <Box
    sx={{
      marginLeft: "350px",
      mt: 4,
      mb: 4,
      px: 4,
      maxWidth: "900px",
      minHeight: "80vh",
    }}
  >
    {/* Header do Aluno */}
    <Box
      sx={{
        mb: 6,
        p: 4,
        bgcolor: "#f3f4f6",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#4f46e5" }}>
        Aluno: {usuario.Nome}
      </Typography>
    </Box>

    {/* Turmas */}
    <Box
      sx={{
        mb: 6,
        p: 4,
        bgcolor: "#ffffff",
        borderRadius: 3,
        boxShadow: 3,
        transition: "all 0.2s",
        "&:hover": { boxShadow: 6 },
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#1e40af" }}>
        Turmas
      </Typography>
      {turmas.length === 0 ? (
        <Typography sx={{ color: "#6b7280" }}>
          Este aluno não está matriculado em nenhuma turma.
        </Typography>
      ) : (
        <Box component="ul" sx={{ pl: 3, "& li": { mb: 1, fontWeight: 500, color: "#374151" } }}>
          {turmas.map((turma) => (
            <li key={turma.Id}>{turma.Nome}</li>
          ))}
        </Box>
      )}
    </Box>

    {/* Provas */}
    <Box
      sx={{
        mb: 6,
        p: 4,
        bgcolor: "#ffffff",
        borderRadius: 3,
        boxShadow: 3,
        transition: "all 0.2s",
        "&:hover": { boxShadow: 6 },
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#1e40af" }}>
        Provas
      </Typography>
      {provas.length === 0 ? (
        <Typography sx={{ color: "#6b7280" }}>Nenhuma prova disponível.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {provas.map((prova) => (
            <Box
              key={prova.id}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#f9fafb",
                boxShadow: 1,
                transition: "all 0.2s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4f46e5" }}>
                {prova.titulo} - {prova.disciplina}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Entrega: {new Date(prova.dataEntrega).toLocaleDateString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  </Box>
</Box>
  );
}
