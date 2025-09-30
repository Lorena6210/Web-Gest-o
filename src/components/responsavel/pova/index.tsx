// components/responsavel/ResponsavelProvasPage.tsx

import React from "react";
import { TurmaCompleta } from "@/lib/TurmaApi";
import { Prova } from "@/lib/provaApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provas: Prova[];
}

export default function ResponsavelProvasPage({ usuario, turmas, provas }: Props) {
  return (
    <div>
      <h1>Provas dos Alunos de {usuario.Nome}</h1>

      <h2>Turmas</h2>
      <ul>
        {turmas.map((turma) => (
          <li key={turma.idTurma}>
            {turma.nome} - {turma.serie}ª Série
          </li>
        ))}
      </ul>

      <h2>Provas</h2>
      {provas.length === 0 && <p>Não há provas cadastradas.</p>}
      <ul>
        {provas.map((prova) => (
          <li key={prova.id} style={{ marginBottom: "1rem" }}>
            <strong>{prova.titulo}</strong> ({prova.disciplina})<br />
            Turma: {prova.turma}<br />
            Professor: {prova.professor}<br />
            Data de Entrega:{" "}
            {new Date(prova.dataEntrega).toLocaleDateString()}<br />
            Descrição: {prova.descricao}
          </li>
        ))}
      </ul>
    </div>
  );
}
