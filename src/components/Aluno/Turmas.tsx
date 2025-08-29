import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { TurmaCompleta, Disciplina } from '@/Types/Turma';

interface Usuario {
  Nome: string;
  Id: number;
}

interface AlunoPageProps {
  usuario: Usuario;
  turmaId: number; // Passar o ID da turma como prop
}

const handleConteudoClick = (disciplina: Disciplina) => {
  if (typeof window !== 'undefined') {
    window.location.href = `pages/disciplina/${disciplina.Id}/conteudo`;
  }
};

const handleNotasClick = (disciplina: Disciplina) => {
  console.log('Acessar notas de:', disciplina.Nome);
};

export default function Turmas({ usuario, turmaId }: AlunoPageProps) {
  const [turma, setTurma] = useState<TurmaCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTurma() {
      try {
        const response = await fetch(`http://localhost:3000/turmas/${turmaId}/completa`);
        const data = await response.json();
        setTurma(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar turma:', error);
        setError('Erro ao buscar turma.');
        setLoading(false);
      }
    }

    fetchTurma();
  }, [turmaId]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!turma) {
    return <div>Nenhuma turma encontrada.</div>;
  }

  return (
    <div style={{ display: 'flex', maxWidth: "100%", width: '100%', height: '90vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar usuario={usuario} />
      <main style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
      }}>
        <h2 style={{
          textAlign: 'center',
          background: '#4CAF50',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          margin: '0 auto 20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}>
          {turma.Nome}
        </h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
        }}>
          {turma.disciplinas?.map((disciplina, i) => (
            <div
              key={i}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,245,0.9) 100%)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                flex: '0 0 calc(30% - 20px)',
                minHeight: '180px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #F76969 0%, #4CAF50 100%)'
              }}></div>

              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 12px',
                borderRadius: '12px',
                background: 'rgba(247, 105, 105, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F76969',
                fontSize: '24px'
              }}>
                <i className="fas fa-book-open"></i>
              </div>

              <h3 style={{
                margin: '0 0 16px',
                color: '#333',
                fontSize: '1.2em',
                fontWeight: '600',
                lineHeight: '1.4'
              }}>
                {disciplina.Nome}
              </h3>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={() => handleConteudoClick(disciplina)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    fontSize: '0.9em',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <i className="fas fa-file-alt" style={{ fontSize: '0.9em' }}></i>
                  Conteúdo
                </button>
                
                <button 
                  onClick={() => handleNotasClick(disciplina)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #2196F3 0%, #0d47a1 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: '500',
                    fontSize: '0.9em',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <i className="fas fa-chart-bar" style={{ fontSize: '0.9em' }}></i>
                  Notas
                </button>
              </div>

              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(247, 105, 105, 0.1)',
                color: '#F76969',
                padding: '4px 8px',
                borderRadius: '20px',
                fontSize: '0.7em',
                fontWeight: '600'
              }}>
                {turma.disciplinas && turma.disciplinas.length > 0 ? (
                <div>
                  {i + 1}/{turma.disciplinas.length}
                </div>
              ) : (
                <div>Nenhuma disciplina encontrada.</div>
              )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
