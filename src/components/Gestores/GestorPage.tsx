
import React from 'react';
import{ TurmaCompleta } from '@/Types/Turma';
import TurmasCard from './TurmaCard';

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
  return <TurmasCard usuario={usuario} turmas={turmas} />;
}
