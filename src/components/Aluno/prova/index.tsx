// components/Aluno/prova.tsx
import { Prova, NotaProva } from "@/lib/provaApi";
import { TurmaCompleta } from "@/Types/Turma";
import Box from "@mui/material/Box";
import Navbar from "../Navbar";

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

export default function AlunoPageComponent({ usuario, turmas, provas, notas }: Props) {
  return (
  <Box>
    <Navbar usuario={usuario} turmas={turmas} />
  <Box sx={{ padding: 2, marginLeft: '320px' }}>
    <div style={{ padding: "20px" }}>
      <h1>Provas do Aluno {usuario.Nome}</h1>

      {turmas.map((turma) => (
        <div key={turma.Id} style={{ marginBottom: "20px" }}>
          <h2>Turma {turma.Nome}</h2>
          <ul>
            {provas
              .filter((prova) => prova.turmaId === turma.Id)
              .map((prova) => {
                const nota = notas.find((n) => n.provaId === prova.id && n.alunoId === usuario.Id);
                return (
                  <li key={prova.id} style={{ marginBottom: "10px" }}>
                    <strong>{prova.nome}</strong>  
                    <br />
                    Conteúdo: {prova.descricao || "Não informado"}  
                    <br />
                    Nota: <strong>{nota ? nota.valor : "Ainda não lançada"}</strong>
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
