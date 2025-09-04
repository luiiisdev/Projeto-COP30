import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");

  // Pega o usuário logado
  useEffect(() => {
    if (!token) return navigate("/");
    fetch("http://localhost:3000/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsuario(data))
      .catch(() => navigate("/"));
  }, [navigate, token]);

  // Pega os livros do usuário
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3000/books/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error(err));
  }, [token]);

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedAvatar(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const handleAvatarSave = async () => {
    if (!selectedAvatar) return;
    const formData = new FormData();
    formData.append("avatar", selectedAvatar);

    setUploading(true);
    try {
      const response = await fetch("http://localhost:3000/users/avatar", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      // Atualiza o avatar do usuário
      setUsuario(prevUsuario => ({
        ...prevUsuario,
        avatar: data.avatar,
      }));

      setSelectedAvatar(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!usuario) return <p className="loading">Carregando...</p>;

  return (
    <div className="profile-page">
      {/* Navbar com botão Voltar */}
      <nav className="navbar-profile">
        <h1 className="logo">📚 DoaLivro</h1>
        <button className="btn-back" onClick={handleHome}>Voltar</button>
      </nav>

      <div className="profile-container">
        <div className="profile-header">
          <label className="avatar-label">
            <img
              src={previewAvatar || (usuario.avatar ? `http://localhost:3000${usuario.avatar}` : "/default-avatar.png")}
              alt="Avatar"
              className="profile-avatar"
            />
            <input type="file" onChange={handleAvatarSelect} style={{ display: "none" }} />
          </label>
          {selectedAvatar && (
            <button className="btn-save-avatar" onClick={handleAvatarSave} disabled={uploading}>
              {uploading ? "Salvando..." : "Salvar Avatar"}
            </button>
          )}
          <h2>{usuario.name}</h2>
          <p>{usuario.email}</p>

          {/* Botão de Sair embaixo da foto */}
        </div>

        <h3>Seus livros</h3>
        <div className="book-grid-profile">
          {books.length === 0 && <p>Você ainda não adicionou livros.</p>}
          {books.map(book => (
            <div className="book-card-profile" key={book.id}>
              <div className="book-image">📖</div>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <p>{book.type === "venda" ? `R$ ${book.price}` : "Doação"}</p>
            </div>
          ))}
        </div>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>

      </div>

      <footer className="footer-profile">
        <p>📚 DoaLivro &copy; 2025</p>
      </footer>
    </div>
  );
}
