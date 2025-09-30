// components/Aluno/AlunoView.tsx
import { TurmaCompleta } from "@/Types/Turma";
import { NotaProva } from "@/lib/provaApi";
import { Prova } from "@/pages/aluno/[id]";
import Navbar from "../Navbar";
import { Box } from "@mui/material"


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
      <Navbar usuario={usuario} turmas = {turmas} />
    <div className="p-6 space-y-6" style={{marginLeft:"350px"}}>
      <section>
        <h1 className="text-2xl font-bold">Aluno: {usuario.Nome}</h1>
        <p>Tipo: {usuario.Tipo}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-4">Turmas</h2>
        {turmas.length === 0 ? (
          <p>Este aluno não está matriculado em nenhuma turma.</p>
        ) : (
          <ul className="list-disc ml-6">
            {turmas.map((turma) => (
              <li key={turma.Id}>{turma.Nome}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-4">Provas</h2>
        {provas.length === 0 ? (
          <p>Nenhuma prova disponível.</p>
        ) : (
          <ul className="space-y-2">
            {provas.map((prova) => (
              <li key={prova.id} className="border p-2 rounded">
                <strong>{prova.titulo}</strong> - {prova.disciplina}
                <br />
                <small>
                  Entrega: {new Date(prova.dataEntrega).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-4">Notas</h2>
        {notas.length === 0 ? (
          <p>Este aluno ainda não possui notas.</p>
        ) : (
          <ul className="space-y-1">
            {notas.map((nota, i) => (
              <li key={i}>
                Prova {nota.idProva}: {nota.valor}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
   </Box>
  );
}
