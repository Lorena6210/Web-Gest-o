import { useState } from "react";
import {TurmaCompleta} from '@/Types/Turma';

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface ResponsavelPageProps {
  usuario: Usuario;
  turmas: TurmaCompleta[];
}

export default function ResponsavelPage({ usuario, turmas }: ResponsavelPageProps) {
  const [search, setSearch] = useState("");
  const searchLower = search.toLowerCase();

const turmasFiltradas = Array.isArray(turmas)
  ? turmas.filter(
      (t) =>
        t?.Nome?.toLowerCase().indexOf(searchLower) !== -1 ||
        (Array.isArray(t?.disciplinas) &&
          t.disciplinas.some((d) =>
            d?.Nome?.toLowerCase().indexOf(searchLower) !== -1
          ))
    )
  : [];

  return (
    <div className="flex h-screen text-black">
      {/* Menu lateral */}
      <aside className="bg-green-500 w-60 p-6 flex flex-col text-white">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 text-green-500 font-bold text-3xl">
            {usuario.Nome[0].toUpperCase()}
          </div>
          <div className="font-bold text-lg">{usuario.Nome}</div>
          <div className="text-sm text-green-200">Responsável</div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-8 bg-gray-100 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <input
            type="search"
            placeholder="Buscar turmas ou disciplinas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300 mb-6"
          />

          <div className="grid grid-cols-2 gap-6">
            {turmasFiltradas.length === 0 && (
              <p className="col-span-2 text-center text-gray-500">
                Nenhuma turma encontrada
              </p>
            )}

            {turmasFiltradas.map((turma) => (
              <div key={turma.Id} className="rounded-md shadow-md overflow-hidden bg-white">
                <div className="bg-gray-300 p-3 font-bold">{turma.Nome}</div>
                <div className="p-2 text-gray-700">
                  {turma.disciplinas ?.map((d) => d.Nome).join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
