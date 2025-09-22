// components/Aluno/prova.tsx

import React from "react";
import { TurmaCompleta } from "@/Types/Turma";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

const AlunoPageComponent: React.FC<Props> = ({ usuario, turmas }) => {
  return (
    <div>
      <h1>Bem-vindo, {usuario.Nome}</h1>
      <h2>Turmas:</h2>

      {turmas.length === 0 ? (
        <p>Você não está matriculado em nenhuma turma.</p>
      ) : (
        <ul>
          {turmas.map((turma) => (
            <li key={turma.Id}>
              <strong>{turma.Nome}</strong> - {turma.AnoLetivo}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlunoPageComponent;
