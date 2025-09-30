// components/responsavel/ResponsavelGradeCurricularPage.tsx

import React from "react";
import { TurmaCompleta } from "@/lib/TurmaApi";
import { Disciplina } from "@/components/Gestores/TurmaCard";
import { GradeCurricular } from "@/lib/gradeCurricular";

interface Usuario {
  Id: number;
  Nome: string;
  Tipo: string;
}

interface Professor {
  Id: number;
  Nome: string;
  Email: string;
  Telefone?: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  gradeCurricular: (GradeCurricular & { Disciplinas: Disciplina[] })[];
  disciplinas: Disciplina[];
  professores: Professor[];
}

export default function ResponsavelGradeCurricularPage({
  usuario,
  turmas,
  gradeCurricular,
  professores,
}: Props) {
  const getProfessorNome = (id: number) =>
    professores.find((p) => p.Id === id)?.Nome || "Desconhecido";

  return (
    <div>
      <h1>Grade Curricular - {usuario.Nome}</h1>

      <h2>Turmas</h2>
      <ul>
        {turmas.map((turma) => (
          <li key={turma.idTurma}>
            {turma.nome} - {turma.serie}ª Série
          </li>
        ))}
      </ul>

      <h2>Grades</h2>
      {gradeCurricular.length === 0 ? (
        <p>Nenhuma grade curricular encontrada.</p>
      ) : (
        gradeCurricular.map((grade) => (
          <div key={grade.Id_GradeCurricular} style={{ marginBottom: "2rem" }}>
            <h3>Grade #{grade.Id_GradeCurricular}</h3>
            <ul>
              {grade.Disciplinas.map((disc) => (
                <li key={disc.Id_Disciplina}>
                  <strong>{disc.Nome}</strong> - {disc.CargaHoraria}h - Bimestre {disc.Bimestre}<br />
                  Professor: {getProfessorNome(disc.Id_Professor)}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
