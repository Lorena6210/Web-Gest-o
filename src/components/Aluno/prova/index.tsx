// components/Aluno/prova.tsx
import { TurmaCompleta } from "@/Types/Turma";
import Box from "@mui/material/Box";
import Navbar from "../Navbar";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface ProvaCompleta {
  prova: {
    id: number;
    titulo: string;
    descricao?: string;
    turma: { id: number; nome: string };
    professor: { nome: string };
    disciplina: { nome: string };
    notas: {
      Id: number;
      idAluno: number;
      nomeAluno: string;
      Valor: number;
    }[];
  };
  filtroBimestre: number;
  totalAlunosComNotas: number;
  totalFaltas: number;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provas: ProvaCompleta[]; // corrigido aqui
}

export default function AlunoPageComponent({ usuario, turmas, provas }: Props) {
  return (
    <Box>
      <Navbar usuario={usuario} turmas={turmas} />
      <Box sx={{ padding: 2, marginLeft: "320px" }}>
        <div style={{ padding: "20px" }}>
          <h1>Provas do Aluno {usuario.Nome}</h1>

          {turmas.map((turma) => (
            <div key={turma.Id} style={{ marginBottom: "20px" }}>
              <h2>Turma {turma.Nome}</h2>
              <ul>
                {provas
                  .filter((p) => p.prova.turma.id === turma.Id)
                  .map((p) => {
                    const { prova } = p;
                    const nota = prova.notas.find((n) => n.idAluno === usuario.Id);
                    return (
                      <li key={prova.id} style={{ marginBottom: "10px" }}>
                        <strong>{prova.titulo}</strong>
                        <br />
                        Disciplina: {prova.disciplina.nome}
                        <br />
                        Professor: {prova.professor.nome}
                        <br />
                        Conteúdo: {prova.descricao || "Não informado"}
                        <br />
                        Nota:{" "}
                        <strong>
                          {nota ? nota.Valor : "Ainda não lançada"}
                        </strong>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </Box>
    </Box>
  );
}
