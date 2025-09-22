import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { fetchUsuarios } from "@/lib/UsuarioApi";
import { fetchTurmaCompleta, TurmaCompleta } from "@/lib/TurmaApi";
import { Boletim } from "@/lib/BoletimApi";
import { fetchBoletimPorAluno } from "@/lib/BoletimApi"; // suposição de função que retorna as notas de um aluno
import ResponsavelPageComponent from "@/components/responsavel/boletim";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface ResponsavelPageProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  boletins: Boletim[];
}

export default function ResponsavelPageContainer({ usuario, turmas, boletins }: ResponsavelPageProps) {
  return (
    <ResponsavelPageComponent
      usuario={usuario}
      turmas={turmas}
      boletins={boletins}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const idNum = Number(id);

  // Buscar dados do responsável
  const usuarios = await fetchUsuarios();
  const usuario = usuarios.responsaveis?.find((u: Usuario) => u.Id === idNum);

  if (!usuario) {
    return { notFound: true };
  }

  // Buscar turmas completas do responsável
  const turmas = await fetchTurmaCompleta(idNum); // supõe que retorna lista de turmas em que seu(s) filho(s) estão

  // Buscar boletins de todos os alunos vinculados ao responsável
  // Aqui supomos que turmas contêm "alunos"
  const alunos = turmas.flatMap(t => t.alunos || []);
  // opcional: eliminar duplicados pelo ID se aluno em mais de uma turma

  // Buscar boletim por aluno
  let boletins: Boletim[] = [];
  for (const aluno of alunos) {
    const b = await fetchBoletimPorAluno(aluno.Id);
    boletins = boletins.concat(b);
  }

  return {
    props: {
      usuario,
      turmas: Array.isArray(turmas) ? turmas : [],
      boletins: boletins,
    },
  };
};
