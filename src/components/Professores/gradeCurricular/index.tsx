import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  GradeCurricular,
  Disciplina,
  fetchGradesCurriculares,
} from "@/lib/gradeCurricular";

interface Props {
  usuario?: any;
}

export default function ProfessorGradeCurricular({ usuario }: Props) {
  const [grades, setGrades] = useState<GradeCurricular[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await fetchGradesCurriculares();
        // Adicionar Disciplinas vazias se não existir
        setGrades(data.map(g => ({ ...g, Disciplinas: g.Disciplinas || [] })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const handleAtualizarDisciplina = (gradeId: number, disciplina: Disciplina) => {
    const novoNome = prompt("Novo nome da disciplina:", disciplina.Nome);
    if (novoNome) {
      setGrades(prev =>
        prev.map(g =>
          g.Id === gradeId
            ? {
                ...g,
                Disciplinas: g.Disciplinas!.map(d =>
                  d.Codigo === disciplina.Codigo ? { ...d, Nome: novoNome } : d
                ),
              }
            : g
        )
      );
      console.log(`Atualizada disciplina ${disciplina.Codigo} para ${novoNome}`);
    }
  };

  const handleDeletarDisciplina = (gradeId: number, codigo: string) => {
    if (confirm("Deseja realmente deletar esta disciplina?")) {
      setGrades(prev =>
        prev.map(g =>
          g.Id === gradeId
            ? {
                ...g,
                Disciplinas: g.Disciplinas!.filter(d => d.Codigo !== codigo),
              }
            : g
        )
      );
      console.log(`Deletada disciplina ${codigo}`);
    }
  };

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Grades Curriculares
      </Typography>

      {grades.map(grade => (
        <Paper key={`${grade.Id}-${grade.Id_Turma}`} sx={{ mb: 4, p: 2 }}>
          {grade.Nome_Turma && (
            <Typography variant="subtitle1" color="text.secondary">
              Turma: {grade.Nome_Turma}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {[1, 2].map(semestre => (
            <Box key={semestre} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {semestre}º Semestre
              </Typography>

              {[1, 2].map(bimestre => (
                <Box key={bimestre} sx={{ ml: 2, mb: 2 }}>
                  <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                    {bimestre}º Bimestre
                  </Typography>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Disciplina</TableCell>
                        <TableCell>Carga Horária</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grade.Disciplinas!
                        .filter(d => d.Semestre === semestre && d.Bimestre === bimestre)
                        .map(disciplina => (
                          <TableRow key={disciplina.Codigo}>
                            <TableCell>{disciplina.Codigo}</TableCell>
                            <TableCell>{disciplina.Nome}</TableCell>
                            <TableCell>{disciplina.CargaHoraria}</TableCell>
                            <TableCell>{disciplina.Descricao}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                sx={{ mr: 1 }}
                                onClick={() =>
                                  handleAtualizarDisciplina(grade.Id, disciplina)
                                }
                              >
                                Atualizar
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                  handleDeletarDisciplina(grade.Id, disciplina.Codigo)
                                }
                              >
                                Deletar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>

                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={() =>
                      alert(`Cadastrar disciplina no ${bimestre}º bimestre`)
                    }
                  >
                    Cadastrar Disciplina
                  </Button>
                </Box>
              ))}
            </Box>
          ))}
        </Paper>
      ))}
    </Box>
  );
}
