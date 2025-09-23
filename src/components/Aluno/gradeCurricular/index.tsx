import { GradeCurricular, Disciplina } from "@/lib/gradeCurricular";

interface Props {
  gradeCurricular: GradeCurricular[];
}

export default function TabelaGradeAluno({ gradeCurricular }: Props) {
  if (!gradeCurricular || gradeCurricular.length === 0) {
    return <p>Não há disciplinas disponíveis para exibição.</p>;
  }

  return (
    <div className="overflow-x-auto">
      {gradeCurricular.map((grade) => (
        <div key={grade.Id_GradeCurricular} className="mb-8">
          <h2 className="text-xl font-bold mb-4">{grade.Descricao_Grade}</h2>
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Disciplina</th>
                <th className="px-4 py-2 border">Semestre</th>
                <th className="px-4 py-2 border">Ordem</th>
                <th className="px-4 py-2 border">Carga Horária</th>
                <th className="px-4 py-2 border">Bimestre</th>
                <th className="px-4 py-2 border">Obrigatória</th>
              </tr>
            </thead>
            <tbody>
              {grade.Disciplinas.map((disciplina: Disciplina) => (
                <tr key={disciplina.Id_GradeDisciplina}>
                  <td className="px-4 py-2 border">{disciplina.Nome_Disciplina}</td>
                  <td className="px-4 py-2 border">{disciplina.Semestre}</td>
                  <td className="px-4 py-2 border">{disciplina.Ordem}</td>
                  <td className="px-4 py-2 border">{disciplina.CargaHoraria}</td>
                  <td className="px-4 py-2 border">{disciplina.Bimestre}</td>
                  <td className="px-4 py-2 border">
                    {disciplina.Obrigatoria ? "Sim" : "Não"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
