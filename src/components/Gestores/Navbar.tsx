"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt } from "react-icons/fa";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { VscAccount } from "react-icons/vsc";

interface Usuario {
  Nome: string;
  Id: number;
}

interface AlunoPageProps {
  usuario: Usuario;
}

// Sidebar Component
export default function Navbar({ usuario }: AlunoPageProps) {
  const router = useRouter();

const goToAlunos = () => {
  router.push(`/gestor/aluno/${usuario.Id}`);
};

const goToProfessores = () => {
  router.push(`/gestor/professor/${usuario.Id}`);
};

const goToEventos = () => {
  router.push(`/gestor/evento/${usuario.Id}`);
};


  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "250px",
        height: "100vh",
        background: "#A3CF38",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Logo e Nome */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <svg
          width="150"
          height="202"
          viewBox="0 0 199 202"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M99.5 0C44.576 0 0 45.248 0 101C0 156.752 44.576 202 99.5 202C154.424 202 199 156.752 199 101C199 45.248 154.424 0 99.5 0ZM99.5 30.3C116.017 30.3 129.35 43.834 129.35 60.6C129.35 77.366 116.017 90.9 99.5 90.9C82.983 90.9 69.65 77.366 69.65 60.6C69.65 43.834 82.983 30.3 99.5 30.3ZM99.5 173.72C74.625 173.72 52.6355 160.792 39.8 141.198C40.0985 121.099 79.6 110.09 99.5 110.09C119.3 110.09 158.902 121.099 159.2 141.198C146.365 160.792 124.375 173.72 99.5 173.72Z"
            fill="white"
          />
        </svg>
        <h2 style={{ fontSize: "24px", margin: "10px 0" }}>{usuario.Nome}</h2>

        {/* Menu Principal */}
        <nav style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li
              onClick={goToAlunos}
              style={{
                margin: "20px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <VscAccount />
              <span style={{ marginLeft: "10px", fontSize: "18px" }}>Alunos</span>
            </li>
            <li
              onClick={goToProfessores}
              style={{
                margin: "20px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LiaChalkboardTeacherSolid />
              <span style={{ marginLeft: "10px", fontSize: "18px" }}>Professores</span>
            </li>
            <li
              onClick={goToEventos}
              style={{
                margin: "20px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaCalendarAlt />
              <span style={{ marginLeft: "10px", fontSize: "18px" }}>Eventos Escolares</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Rodapé do Menu */}
      <div>
        {/* Ajuda */}
        <div style={{ marginBottom: "10px", marginTop: "50px", display: "flex", alignItems: "center" }}>
          <button
            onClick={() => console.log("Usuário solicitou ajuda")}
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg width="25" height="30" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8416 32H19.2662V28H15.8416V32ZM17.5539 0C8.10215 0 0.431152 8.96 0.431152 20C0.431152 31.04 8.10215 40 17.5539 40C27.0057 40 34.6767 31.04 34.6767 20C34.6767 8.96 27.0057 0 17.5539 0ZM17.5539 36C10.0028 36 3.8557 28.82 3.8557 20C3.8557 11.18 10.0028 4 17.5539 4C25.105 4 31.2521 11.18 31.2521 20C31.2521 28.82 25.105 36 17.5539 36ZM17.5539 8C13.7698 8 10.7048 11.58 10.7048 16H14.1294C14.1294 13.8 15.6704 12 17.5539 12C19.4374 12 20.9785 13.8 20.9785 16C20.9785 20 15.8416 19.5 15.8416 26H19.2662C19.2662 21.5 24.403 21 24.403 16C24.403 11.58 21.338 8 17.5539 8Z" fill="white"/>
            </svg>
            <span style={{ marginLeft: "10px" }}>Ajuda</span>
          </button>
        </div>

        {/* Configurações */}
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => console.log("Usuário acessou configurações")}
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg width="25" height="30" viewBox="0 0 35 39" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M33.6766 22.0227V16.9773L28.8559 16.2322C28.5724 14.9502 28.1222 13.7231 27.5201 12.5911L30.4648 8.20155L27.3212 4.63441L23.4474 7.97114C22.4484 7.28889 21.3655 6.77877 20.2341 6.4575L19.5766 1H15.124L14.4664 6.46255C13.335 6.78382 12.2521 7.29394 11.2531 7.97618L7.37933 4.63441L4.23131 8.20155L7.17599 12.5911C6.57391 13.7231 6.12372 14.9502 5.8402 16.2322L1.02393 16.9773V22.0227L5.84465 22.7678C6.12817 24.0498 6.57836 25.2769 7.18044 26.4089L4.23576 30.7985L7.38378 34.3656L11.2576 31.0289C12.2565 31.7111 13.3395 32.2212 14.4709 32.5425L15.124 38H19.5766L20.2341 32.5375C21.3655 32.2162 22.4484 31.7061 23.4474 31.0238L27.3212 34.3605L30.4692 30.7934L27.5246 26.4039C28.1266 25.2719 28.5768 24.0448 28.8603 22.7627L33.6766 22.0227Z" stroke="white" strokeWidth="2" />
              <path d="M17.3502 24.5454C19.8093 24.5454 21.8029 22.2865 21.8029 19.5C21.8029 16.7135 19.8093 14.4545 17.3502 14.4545C14.8911 14.4545 12.8976 16.7135 12.8976 19.5C12.8976 22.2865 14.8911 24.5454 17.3502 24.5454Z" stroke="white" strokeWidth="2" />
            </svg>
            <span style={{ marginLeft: "10px" }}>Configurações</span>
          </button>
        </div>

        {/* Sair */}
        <div>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg width="25" height="30" viewBox="0 0 31 39" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.2964 8.66667L21.1628 11.7217L25.0668 17.3333H9.6778V21.6667H25.0668L21.1628 27.2567L23.2964 30.3333L30.8622 19.5L23.2964 8.66667ZM3.6251 4.33333H15.7305V0H3.6251C1.96061 0 0.598755 1.95 0.598755 4.33333V34.6667C0.598755 37.05 1.96061 39 3.6251 39H15.7305V34.6667H3.6251V4.33333Z" fill="white"/>
            </svg>
            <span style={{ marginLeft: "10px" }}>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "4px",
  transition: "background-color 0.3s",
  fontWeight: "500",
  fontSize: "14px",
  width: "100%",
  textAlign: "left",
};
