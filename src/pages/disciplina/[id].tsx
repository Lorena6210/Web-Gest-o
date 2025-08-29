"use client";
import React from 'react';
import {TurmaCompleta, Disciplina } from '@/Types/Turma';
// import favicon from "./favicon.ico";


interface Usuario {
    Nome: string;
    Id: number;
    Tipo: string;
}

interface DisciplinaPageProps {
    usuario: Usuario;
    disciplina: Disciplina;
    turmas: TurmaCompleta[];
}


export default function DisciplinaPage({ disciplina, turmas }: DisciplinaPageProps) {
    return (
        <div>
            <h1>Disciplina: {disciplina?.Nome}</h1>
            <h2>Turmas:</h2>
            {turmas.map((turma) => (
                <div key={turma.Id}>
                    <h3>{turma.Nome}</h3>
                    {/* <p>{turma.Descricao}</p> */}
                </div>
            ))}
        </div>
    );
}