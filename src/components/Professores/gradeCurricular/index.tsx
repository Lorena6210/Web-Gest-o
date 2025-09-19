import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../Navbar";
import { Box, Button, CircularProgress, Tooltip } from "@mui/material";
import { fetchGradeCurricular } from "@/lib/gradeCurricular";

interface GradeCurricular {
  Id_Turma: number;
  Id_Disciplina: number;
  Codigo_Disciplina: string;
  Nome_Disciplina: string;
  Id_Professor: number;
  Nome_Professor: string;
  Semestre: number;
  Credito?: number;
  CargaHoraria?: number;  
  Obrigatoria?: boolean;
  Descricao?: string;   // ✅ adicionado
}

interface Usuario {
  Nome: string;
  Id: number;
}

interface Props {
  usuario: Usuario[];
  idTurma: number;
  professorId: number;
  onAtualizar?: (idDisciplina: number) => void;
  onExcluir?: (idDisciplina: number) => void;
  onCadastrarDisciplina?: (semestre: number) => void;
  onCadastrarGrade?: () => void;
}

const TabelaDisciplinas: React.FC<{
  disciplinas: GradeCurricular[];
  professorId: number;
  onAtualizar?: (idDisciplina: number) => void;
  onExcluir?: (idDisciplina: number) => void;
}> = ({ disciplinas, professorId, onAtualizar, onExcluir }) => (
  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
    <thead style={{ backgroundColor: "#1976d2", color: "white" }}>
      <tr>
        <th style={{ padding: 8, textAlign: "center" }}>Código</th>
        <th style={{ padding: 8 }}>Disciplina</th>
        <th style={{ padding: 8, textAlign: "center" }}>Crédito</th>
        <th style={{ padding: 8, textAlign: "center" }}>Carga Horária</th> {/* ✅ nova */}
        <th style={{ padding: 8 }}>Descrição</th> {/* ✅ nova */}
        <th style={{ padding: 8, textAlign: "center" }}>Ações</th>
      </tr>
    </thead>
    <tbody>
      {disciplinas.map((grade) => (
        <tr key={grade.Id_Disciplina} style={{ borderBottom: "1px solid #ddd" }}>
          <td style={{ padding: 8, textAlign: "center" }}>{grade.Codigo_Disciplina}</td>
          <td style={{ padding: 8 }}>{grade.Nome_Disciplina}</td>
          <td style={{ padding: 8, textAlign: "center" }}>{grade.Credito ?? "-"}</td>
          <td style={{ padding: 8, textAlign: "center" }}>{grade.CargaHoraria ?? "-"}</td>
          <td style={{ padding: 8 }}>
            {grade.Descricao ? (
              <Tooltip title={grade.Descricao} arrow>
                <span>
                  {grade.Descricao.length > 40
                    ? grade.Descricao.substring(0, 40) + "..."
                    : grade.Descricao}
                </span>
              </Tooltip>
            ) : (
              "—"
            )}
          </td>
          <td style={{ padding: 8, textAlign: "center" }}>
            <Button
              variant="text"
              color="primary"
              size="small"
              disabled={grade.Id_Professor !== professorId}
              onClick={() => onAtualizar && onAtualizar(grade.Id_Disciplina)}
            >
              Atualizar
            </Button>
            <Button
              variant="text"
              color="error"
              size="small"
              disabled={grade.Id_Professor !== professorId}
              onClick={() => onExcluir && onExcluir(grade.Id_Disciplina)}
            >
              Excluir
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default function ProfessorGradeCurricular({
  usuario,
  idTurma,
  professorId,
  onAtualizar,
  onExcluir,
  onCadastrarDisciplina,
  onCadastrarGrade,
}: Props) {
  const [gradeCurricular, setGradeCurricular] = useState<GradeCurricular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarGrade = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGradeCurricular(idTurma, professorId);
        setGradeCurricular(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar a grade curricular.");
      } finally {
        setLoading(false);
      }
    };

    carregarGrade();
  }, [idTurma, professorId]);

  const semestres = useMemo(() => {
    return Array.from(new Set(gradeCurricular.map((g) => g.Semestre))).sort((a, b) => a - b);
  }, [gradeCurricular]);

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
        <p>Carregando grade curricular...</p>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} textAlign="center" color="red">
        <p>{error}</p>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Navbar usuario={usuario} />

      <Box
        sx={{
          maxWidth: 800,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          margin: "0 auto",
        }}
      >
        <h2>Grade Curricular</h2>
        <Button variant="contained" color="primary" onClick={() => onCadastrarGrade && onCadastrarGrade()}>
          Cadastrar Grade
        </Button>
      </Box>

      {semestres.map((semestre) => {
        const disciplinasDoSemestre = gradeCurricular.filter((g) => g.Semestre === semestre);
        return (
          <Box key={semestre} sx={{ mb: 4, maxWidth: 800, margin: "0 auto" }}>
            <h3
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                padding: "8px",
                borderRadius: "4px",
                userSelect: "none",
              }}
            >
              {semestre}º Semestre
            </h3>

            <TabelaDisciplinas
              disciplinas={disciplinasDoSemestre}
              professorId={professorId}
              onAtualizar={onAtualizar}
              onExcluir={onExcluir}
            />

            <Box mt={2} textAlign="right">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => onCadastrarDisciplina && onCadastrarDisciplina(semestre)}
              >
                Cadastrar Disciplina
              </Button>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
