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
    router.push(`/gestor/${usuario.Id}/alunos`);
  };;

  const goToProfessores = () => {
    router.push(`/gestor/${usuario.Id}/professores`); 
  };

  const goToEventos = () => {
    router.push(`/gestor/${usuario.Id}/eventos`); 
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
      </div>
      <nav>
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
  );
}
