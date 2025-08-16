
import React from 'react';
import{ TurmaCompleta } from '@/Types/Turma';
import Turmas from './Turmas';

interface Usuario {
  Nome: string;
  Id: number;
}

interface AlunoPageProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function AlunoPage({ usuario, turmas }: AlunoPageProps) {
  return <Turmas usuario={usuario} turmas={turmas} />;
}
