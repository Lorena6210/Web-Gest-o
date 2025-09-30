// components/responsavel/ResponsavelBoletimPage.tsx

import React from "react";
import { TurmaCompleta } from "@/lib/TurmaApi";
import { Prova } from "@/lib/provaApi";
import { NotaProva } from "@/lib/NotasApi";

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

export default function ResponsavelBoletimPage({
  usuario,
  turmas,
  provas,
  notas,
}: Props) {
  // Agrupar notas por disciplina e bimestre
  const boletimMap = new Map<string, { bimestre: number; notas: number[] }[]>();

  provas.forEach((prova) => {
    const nota = notas.find((n) => n.idProva === prova.id);
    if (!nota) return;

    const key = `${prova.disciplina}`;
    const entry = boletimMap.get(key) || [];

    const bimestreEntry = entry.find((e) => e.bimestre === prova.idBimestre);
    if (bimestreEntry) {
      bimestreEntry.notas.push(nota.nota);
    } else {
      entry.push({ bimestre: prova.idBimestre, notas: [nota.nota] });
    }

    boletimMap.set(key, entry);
  });

  return (
    <div>
      <h1>Boletim Escolar - {usuario.Nome}</h1>

      <h2>Turmas</h2>
      <ul>
        {turmas.map((turma) => (
          <li key={turma.idTurma}>
            {turma.nome} - {turma.serie}ª Série
          </li>
        ))}
      </ul>

      <h2>Notas por Disciplina</h2>
      {boletimMap.size === 0 && <p>Nenhuma nota encontrada.</p>}

      {[...boletimMap.entries()].map(([disciplina, bimestres]) => (
        <div key={disciplina} style={{ marginBottom: "1.5rem" }}>
          <h3>{disciplina}</h3>
          <ul>
            {bimestres.map((b) => {
              const media =
                b.notas.reduce((acc, val) => acc + val, 0) / b.notas.length;
              return (
                <li key={b.bimestre}>
                  Bimestre {b.bimestre}: Média {media.toFixed(1)}{" "}
                  ({b.notas.length} nota{b.notas.length > 1 ? "s" : ""})
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
