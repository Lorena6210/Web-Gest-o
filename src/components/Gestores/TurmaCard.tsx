"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface GestorPageProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export interface Aluno {
  Id: number;
  Nome: string;
  RA: string;
  FotoPerfil?: string | null;
}

export interface Disciplina {
  Id: number;
  Nome: string;
  Codigo: string;
  CargaHoraria: number;
}

export interface TurmaCompleta {
  Id: number;
  Nome: string;
  Serie: string | null;
  AnoLetivo: number;
  Turno: string | null;
  Sala?: string;
  CapacidadeMaxima?: number;
  alunos?: Aluno[];
  professores?: Professor[];
  disciplinas?: Disciplina[];
}

export interface Turma {
  alunos: Aluno[];
  professores: Professor[];
  disciplinas: Disciplina[];
}

export interface Professor {
  Id: number;
  Nome: string;
  Email: string;
  FotoPerfil?: string | null;
  Disciplinas: string;
  TotalDisciplinas: number;
}

const coresTurmas = ["#F76969", "#008D6A", "#F6D769", "#B1D340", "#F69230"];

export default function TurmasCard({ usuario, turmas }: GestorPageProps) {
  const [turmasData, setTurmasData] = useState<TurmaCompleta[]>([]);
  const [turmasFiltradas, setTurmasFiltradas] = useState<TurmaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCriarModal, setShowCriarModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState<TurmaCompleta | null>(null);

  // Simulação de API
  async function listarTurmas(): Promise<{ success: boolean; data: TurmaCompleta[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: turmas });
      }, 1000);
    });
  }

  async function carregarTurmas() {
    setLoading(true);
    const resp = await listarTurmas();
    if (resp.success) {
      setTurmasData(resp.data);
      setTurmasFiltradas(resp.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!search) {
      setTurmasFiltradas(turmasData);
    } else {
      const termo = search.toLowerCase();
      setTurmasFiltradas(
        turmasData.filter(
          (t) =>
            t.Nome.toLowerCase().includes(termo) ||
            (t.Serie?.toLowerCase().includes(termo) ?? false) ||
            (t.disciplinas && t.disciplinas.some((d) => d.Nome.toLowerCase().includes(termo))) ||
            (t.alunos && t.alunos.some((a) => a.Nome.toLowerCase().includes(termo))) ||
            (t.professores && t.professores.some((p) => p.Nome.toLowerCase().includes(termo)))
        )
      );
    }
  }, [search, turmasData]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <Navbar usuario={usuario} />

      <div className="container mx-auto px-4 py-8">
        {/* Busca e ações */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar turmas, disciplinas, alunos ou professores..."
            className="w-full md:w-auto flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowCriarModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              + Criar Turma
            </button>
            <button
              onClick={carregarTurmas}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              Recarregar
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="loading mx-auto" />
            <p className="mt-4 text-gray-600">Carregando turmas...</p>
          </div>
        )}

        {/* Lista */}
        {!loading && turmasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turmasFiltradas.map((turma, idx) => (
              <div
                key={turma.Id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border-l-4 transition-transform transform hover:scale-105"
                style={{ borderLeftColor: coresTurmas[idx % coresTurmas.length] }}
                onClick={() => setShowDetalhes(turma)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{turma.Nome}</h3>
                  <p className="text-sm text-gray-600">Série: {turma.Serie}</p>
                  <p className="text-sm text-gray-600">Turno: {turma.Turno}</p>
                  <p className="text-sm text-gray-600">Sala: {turma.Sala || "Não definida"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && turmasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma turma encontrada
            </h3>
            <p className="text-gray-500 mb-4">Comece criando sua primeira turma</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
              onClick={() => setShowCriarModal(true)}
            >
              Criar Primeira Turma
            </button>
          </div>
        )}
      </div>

      {/* Modal Criar Turma */}
      {showCriarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Criar Nova Turma</h2>
            </div>
            <div className="p-6">Formulário aqui</div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCriarModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Criar Turma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">{showDetalhes.Nome}</h2>
              <button onClick={() => setShowDetalhes(null)} className="text-gray-600 hover:text-gray-800">
                X
              </button>
            </div>
            <div className="p-6">Detalhes completos aqui...</div>
          </div>
        </div>
      )}
    </div>
  );
}
