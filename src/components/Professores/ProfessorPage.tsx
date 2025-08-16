import React from 'react';
import{ TurmaCompleta } from '@/Types/Turma';
import Turmas from './Turmas';

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string; // Adicionei a propriedade Tipo aqui
}

interface AlunoPageProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function ProfessorPage({ usuario, turmas }: AlunoPageProps) {
  return <Turmas usuario={usuario} turmas={turmas} />;
}
