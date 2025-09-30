// components/responsavel/ResponsavelReunioesPage.tsx

import React from "react";
import { TurmaCompleta } from "@/lib/TurmaApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Reuniao {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  local: string;
  turma: string;
  participantes: string[];
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  reunioes: Reuniao[];
}

export default function ResponsavelReunioesPage({ usuario, turmas, reunioes }: Props) {
  return (
    <div>
      <h1>Reuniões - {usuario.Nome}</h1>

      <h2>Turmas</h2>
      <ul>
        {turmas.map((turma) => (
          <li key={turma.idTurma}>
            {turma.nome} - {turma.serie}ª Série
          </li>
        ))}
      </ul>

      <h2>Reuniões Agendadas</h2>
      {reunioes.length === 0 ? (
        <p>Nenhuma reunião agendada.</p>
      ) : (
        <ul>
          {reunioes.map((reuniao) => (
            <li key={reuniao.id} style={{ marginBottom: "1rem" }}>
              <strong>{reuniao.titulo}</strong><br />
              Data: {new Date(reuniao.data).toLocaleDateString()} às {reuniao.horario}<br />
              Local: {reuniao.local}<br />
              Turma: {reuniao.turma}<br />
              Participantes: {reuniao.participantes.join(", ")}<br />
              Descrição: {reuniao.descricao}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
