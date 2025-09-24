// components/Aluno/gradeCurricular/index.tsx
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";
import { GradeCurricular } from "@/lib/gradeCurricular";

interface Props {
  usuario: { Nome: string; Id: number };
  grades: GradeCurricular[];
  idTurma: number;
}

export default function AlunoGradeCurricular({ usuario, grades }: Props) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Olá, {usuario.Nome}! Aqui está sua grade curricular:
      </Typography>

      {grades.map((grade) => (
        <Paper key={grade.Id_GradeCurricular} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {grade.Descricao_Grade}
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Disciplina</TableCell>
                <TableCell>Semestre</TableCell>
                <TableCell>Bimestre</TableCell>
                <TableCell>Carga Horária</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grade.Disciplinas?.map((disciplina) => (
                <TableRow key={disciplina.Id_Disciplina}>
                  <TableCell>{disciplina.Codigo}</TableCell>
                  <TableCell>{disciplina.Nome}</TableCell>
                  <TableCell>{disciplina.Semestre}</TableCell>
                  <TableCell>{disciplina.Bimestre}</TableCell>
                  <TableCell>{disciplina.CargaHoraria}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
    </Box>
  );
}
