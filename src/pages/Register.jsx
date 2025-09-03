import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok || data.token) {
        // opcional: já logar automaticamente após registro
        if (data.token) {
          localStorage.setItem("token", data.token);
          navigate("/");
        } else {
          alert("Registrado com sucesso! Faça login.");
          navigate("/login");
        }
      } else {
        alert(data.error || "Erro ao registrar");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  }

  return (
    <div className="register-container">
      <h2>Registrar Usuário</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrar</button>
      </form>
      <p>
        Já tem conta? <a href="/login">Login</a>
      </p>
    </div>
  );
}
