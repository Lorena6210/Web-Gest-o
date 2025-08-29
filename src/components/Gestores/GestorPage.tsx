
import React from 'react';
import{ TurmaCompleta } from '@/Types/Turma';
import TurmaCard from './TurmaCard';

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string; // ou outro tipo que seja apropriado
}

interface AlunoPageProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function AlunoPage({ usuario, turmas }: AlunoPageProps) {
  return <TurmaCard usuario={usuario} turmas={turmas} />;
}
