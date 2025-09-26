// components/Professores/ProfessorPage.tsx
import { useMemo } from "react";
import { TurmaCompleta } from "@/Types/Turma";
import { NotaProva } from "@/lib/provaApi";

interface Usuario {
  Nome: string;
  Id: number;
  Tipo: string;
}

interface Props {
  usuario: Usuario;
  turmas: TurmaCompleta[];
  provasPorTurma: Record<number, any>; // não usamos provas, mas mantido para compatibilidade
  notasProvas: NotaProva[];
}

export default function ProfessorPageComponent({
  usuario,
  turmas,
  provasPorTurma,
  notasProvas,
}: Props) {
  // Agrupar notas por turma
  const notasPorTurma = useMemo(() => {
    const agrupado: Record<number, NotaProva[]> = {};
    for (const nota of notasProvas) {
      if (!agrupado[nota.Id_Turma]) agrupado[nota.Id_Turma] = [];
      agrupado[nota.Id_Turma].push(nota);
    }
    return agrupado;
  }, [notasProvas]);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho do professor */}
      <header className="bg-blue-600 text-white p-4 rounded-2xl shadow">
        <h1 className="text-2xl font-bold">{usuario.Nome}</h1>
        <p className="text-sm">ID: {usuario.Id}</p>
      </header>

      {/* Turmas */}
      {turmas.map((turma) => (
        <div
          key={turma.Id}
          className="bg-white shadow rounded-2xl p-4 space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-700">
            Turma: {turma.Nome}
          </h2>

          {/* Notas da turma */}
          {notasPorTurma[turma.Id] && notasPorTurma[turma.Id].length > 0 ? (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border px-2 py-1">Aluno</th>
                  <th className="border px-2 py-1">Nota</th>
                  <th className="border px-2 py-1">Bimestre</th>
                  <th className="border px-2 py-1">Prova</th>
                </tr>
              </thead>
              <tbody>
                {notasPorTurma[turma.Id].map((nota) => (
                  <tr key={nota.Id}>
                    <td className="border px-2 py-1">{nota.NomeAluno}</td>
                    <td className="border px-2 py-1 text-center">{nota.Valor}</td>
                    <td className="border px-2 py-1">{nota.NomeBimestre}</td>
                    <td className="border px-2 py-1">{nota.TituloProva}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">
              Nenhuma nota lançada para esta turma nesta prova.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
