import React from "react";
import { Prova, NotaProva } from "@/lib/provaApi";

interface ProvaCardProps {
  prova: Prova;
  notas: NotaProva[];
}

const ProvaCard: React.FC<ProvaCardProps> = ({ prova, notas }) => {
  return (
    <div className="border rounded-md shadow p-4 mb-4">
      <h2 className="text-lg font-bold">{prova.Nome}</h2>
      <p className="text-sm text-gray-600">Data: {new Date(prova.Data).toLocaleDateString()}</p>

      <div className="mt-3">
        <h3 className="font-semibold">Notas:</h3>
        {notas.length > 0 ? (
          <ul className="list-disc list-inside">
            {notas.map((nota) => (
              <li key={nota.AlunoId}>
                Aluno #{nota.AlunoId}: {nota.Nota}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma nota cadastrada.</p>
        )}
      </div>
    </div>
  );
};

export default ProvaCard;
