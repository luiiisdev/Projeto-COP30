import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // salva token e nome no localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.name);

        navigate("/"); // redireciona para home
      } else {
        alert(data.error || "Erro ao logar");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Entrar</button>
      </form>
      <a href="/register">Ainda não tem conta? Registre-se</a>
    </div>
  );
}
