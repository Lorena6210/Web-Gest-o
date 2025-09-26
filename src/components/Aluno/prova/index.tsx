// components/Professor/prova.tsx
import React, { useState } from "react";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface TurmaCompleta {
  Id: number;
  Nome: string;
  // Adicione outros campos conforme necessário
}

interface Prova {
  Id: number;
  Titulo: string;
  // Adicione outros campos conforme necessário
}

interface NotaProva {
  Id: number;
  Id_Aluno: number;
  NomeAluno: string;
  Id_Turma: number;
  Id_Bimestre: number;
  Valor: string;
  NomeBimestre: string;
  IdProva: number;
  TituloProva: string;
  Id_Professor: number;
  NomeProfessor: string;
  Id_Disciplina: number;
  NomeDisciplina: string;
  ProvaIdTurma: number;
  NomeTurma: string;
  ProvaIdBimestre: number;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provas: Prova[];
  notas: NotaProva[];
}

const AlunoPageComponent: React.FC<Props> = ({ usuario, turmas, provas, notas }) => {
  const [selectedBimestre, setSelectedBimestre] = useState<number | null>(null); // Filtro por bimestre (null = todos)

  // Filtrar notas baseado no bimestre selecionado
  const notasFiltradas = selectedBimestre
    ? notas.filter((nota) => nota.Id_Bimestre === selectedBimestre)
    : notas;

  // Agrupar notas por prova, e dentro por aluno (para melhor visualização)
  const notasPorProva = notasFiltradas.reduce((acc: { [key: number]: { [key: number]: NotaProva[] } }, nota) => {
    if (!acc[nota.IdProva]) {
      acc[nota.IdProva] = {};
    }
    if (!acc[nota.IdProva][nota.Id_Aluno]) {
      acc[nota.IdProva][nota.Id_Aluno] = [];
    }
    acc[nota.IdProva][nota.Id_Aluno].push(nota);
    return acc;
  }, {});

  // Obter opções únicas de bimestre para o filtro
  const bimestresUnicos = [...new Set(notas.map((nota) => nota.Id_Bimestre))].sort((a, b) => a - b);
  const bimestreOptions = [
    { id: null, nome: "Todos os Bimestres" },
    ...bimestresUnicos.map((id) => ({ id, nome: notas.find((n) => n.Id_Bimestre === id)?.NomeBimestre || `Bimestre ${id}` })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel do Professor, {usuario.Nome}!
          </h1>
          <p className="text-lg text-gray-600">
            Visualize as notas dos alunos nas suas provas. Filtre por bimestre para refinar a visualização.
          </p>
        </div>

        {/* Filtro por Bimestre */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Bimestre:
          </label>
          <select
            value={selectedBimestre || ""}
            onChange={(e) => setSelectedBimestre(e.target.value ? Number(e.target.value) : null)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {bimestreOptions.map((option) => (
              <option key={option.id || "todos"} value={option.id || ""}>
                {option.nome}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Total de notas exibidas: {notasFiltradas.length}
          </p>
        </div>

        {/* Seção de Turmas (opcional, turmas que o professor leciona) */}
        {turmas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Suas Turmas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {turmas.map((turma) => (
                <div key={turma.Id} className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-medium text-gray-900">{turma.Nome}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de Provas e Notas dos Alunos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Notas dos Alunos por Prova</h2>
          {Object.keys(notasPorProva).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma nota encontrada para o filtro selecionado.</p>
            </div>
          ) : (
            Object.entries(notasPorProva).map(([provaId, alunosPorProva]) => {
              const primeiraNota = Object.values(alunosPorProva).flat()[0]; // Primeira nota para dados da prova
              return (
                <div key={provaId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Cabeçalho da Prova */}
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
                    <h3 className="text-xl font-bold">{primeiraNota.TituloProva}</h3>
                    <p className="text-purple-100 mt-1">
                      Disciplina: {primeiraNota.NomeDisciplina} | Turma: {primeiraNota.NomeTurma}
                    </p>
                  </div>

                  {/* Notas por Aluno */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {Object.entries(alunosPorProva).map(([alunoId, notasDoAluno]) => {
                        const nota = notasDoAluno[0]; // Assumindo uma nota por aluno por prova (ajuste se múltiplas)
                        return (
                          <div key={alunoId} className="bg-gray-50 rounded-md p-4 border-l-4 border-purple-500">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">Aluno: {nota.NomeAluno}</span>
                              <span className="text-2xl font-bold text-green-600">{nota.Valor}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Bimestre:</span> {nota.NomeBimestre}
                            </p>
                            {notasDoAluno.length > 1 && (
                              <p className="text-sm text-gray-500 mt-1 italic">
                                {notasDoAluno.length} notas para este aluno.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500 mt-4 italic">
                      Total de alunos com notas nesta prova: {Object.keys(alunosPorProva).length}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé com resumo */}
        {notasFiltradas.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumo Geral</h3>
            <p className="text-gray-600">
              Média das notas: {(
                notasFiltradas.reduce((sum, nota) => sum + parseFloat(nota.Valor), 0) / notasFiltradas.length
              ).toFixed(2) || "N/A"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total de notas: {notasFiltradas.length} | Alunos únicos: {[...new Set(notasFiltradas.map(n => n.Id_Aluno))].length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlunoPageComponent;
