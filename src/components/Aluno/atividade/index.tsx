// components/Alunos/AlunoPageContainer.tsx
import React from "react";
import { TurmaCompleta } from '@/Types/Turma';

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Atividade {
  id: number;
  titulo: string;
  turmaId: number;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  atividades: Atividade[];
}

const AlunoPageContainer: React.FC<Props> = ({ usuario, turmas, atividades }) => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Olá, {usuario.Nome}</h1>

      <section>
        <h2>Suas Turmas</h2>
        {turmas.length > 0 ? (
          <ul>
            {turmas.map((turma) => (
              <li key={turma.id}>{turma.nome}</li>
            ))}
          </ul>
        ) : (
          <p>Você não está matriculado em nenhuma turma.</p>
        )}
      </section>

      <section>
        <h2>Atividades</h2>
        {atividades.length > 0 ? (
          <ul>
            {atividades.map((atividade) => (
              <li key={atividade.id}>
                {atividade.titulo} (Turma: {atividade.turmaId})
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há atividades disponíveis.</p>
        )}
      </section>
    </div>
  );
};

export default AlunoPageContainer;
