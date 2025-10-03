import React from "react";
import { TurmaCompleta } from "@/lib/TurmaApi";
import { Navbar } from "../Navbar"
import { Box } from "@mui/material";
import Navbar from '../Navbar';
import { Usuario } from '../../../lib/jwtLoginStatus';

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface AtividadeDetalhada {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataEntrega: string;
  dataFinalizacao?: string;
  turma: string;
  disciplina: string;
}

interface ResponsavelAtividadesProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  atividades: AtividadeDetalhada[];
}

export default function ResponsavelAtividadesPage({
  usuario,
  turmas,
  atividades,
}: ResponsavelAtividadesProps) {
  return (
    <Box>
      <Navbar Usuario={usuario} />
    <div >
      <h1>Atividades do Responsável: {usuario.Nome}</h1>

      <h2>Turmas</h2>
      <ul>
        {turmas.map((turma) => (
          <li key={turma.idTurma}>
            {turma.nome} - {turma.serie}ª Série
          </li>
        ))}
      </ul>

      <h2>Atividades</h2>
      {atividades.length === 0 && <p>Não há atividades no momento.</p>}
      <ul>
        {atividades.map((atividade) => (
          <li key={atividade.id}>
            <strong>{atividade.titulo}</strong> - {atividade.turma} - {atividade.disciplina}
            <br />
            Prazo de entrega: {new Date(atividade.dataEntrega).toLocaleDateString()}
            <br />
            Descrição: {atividade.descricao}
          </li>
        ))}
      </ul>
    </div>
    </Box>
  );
}
