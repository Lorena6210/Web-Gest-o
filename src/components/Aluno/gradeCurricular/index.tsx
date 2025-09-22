// components/Aluno/gradeCurricular.tsx

import React from "react";
import { GradeCurricular, GradeDisciplina, Disciplina } from "@/lib/gradeCurricular";

interface Usuario {
  Id: number;
  Nome: string;
  Email: string;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  grades: GradeCurricular[];
  disciplinas: Disciplina[];
  gradeDisciplinar: GradeDisciplina[];
  idTurma: number;
}

export default function AlunoGradeCurricular({
  usuario,
  grades,
  disciplinas,
  gradeDisciplinar,
  idTurma,
}: Props) {
  return (
    <div>
      <h1>Grade Curricular</h1>
      <p><strong>Aluno:</strong> {usuario.Nome}</p>
      <p><strong>Turma ID:</strong> {idTurma}</p>

      {grades.length === 0 ? (
        <p>Nenhuma grade curricular encontrada.</p>
      ) : (
        grades.map((grade) => (
          <div key={grade.Id} style={{ border: "1px solid #ccc", margin: "16px", padding: "12px" }}>
            <h2>{grade.Nome}</h2>
            <ul>
              {gradeDisciplinar
                .filter((gd) => gd.idGrade === grade.Id)
                .map((gd) => {
                  const disciplina = disciplinas.find(d => d.Id === gd.idDisciplina);
                  return (
                    <li key={gd.idDisciplina}>
                      {disciplina ? disciplina.Nome : "Disciplina não encontrada"}
                    </li>
                  );
                })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
