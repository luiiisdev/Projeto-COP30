import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Pega usuário logado atualizado
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3000/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsuarioLogado(data))
      .catch(err => console.error(err));
  }, [token]);

  // Pega todos os livros
  useEffect(() => {
    fetch("http://localhost:3000/books", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error(err));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuarioLogado(null);
    window.location.reload();
  };

  const handleProfileClick = () => {
    if (usuarioLogado) navigate("/perfil");
  };

  const filteredBooks = books
    .filter(book => {
      if (filter === "venda") return book.type === "venda";
      if (filter === "doacao") return book.type === "doacao";
      return true;
    })
    .filter(book => book.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="home-shopee">
      <nav className="navbar-shopee">
        <h1 className="logo">📚 DoaLivro</h1>
        <input
          type="text"
          placeholder="Pesquisar livros..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-bar"
        />
        <div className="user-info-shopee">
          {usuarioLogado ? (
            <img
              src={usuarioLogado.avatar ? `http://localhost:3000${usuarioLogado.avatar}` : "/default-avatar.png"}
              alt="Avatar do usuário"
              onClick={handleProfileClick}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                cursor: "pointer",
                objectFit: "cover",
              }}
            />
          ) : (
            <span>Não logado</span>
          )}
        </div>
      </nav>

      <div className="filters-shopee">
        <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>Todos</button>
        <button onClick={() => setFilter("venda")} className={filter === "venda" ? "active" : ""}>Venda</button>
        <button onClick={() => setFilter("doacao")} className={filter === "doacao" ? "active" : ""}>Doação</button>
      </div>

      <div className="book-grid-shopee">
        {filteredBooks.map(book => (
          <div className="book-card-shopee" key={book.id}>
            <div className="book-image">📖</div>
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p>{book.type === "venda" ? `R$ ${book.price}` : "Doação"}</p>
            <div className="book-owner-info">
              <img
                src={book.owner.avatar ? `http://localhost:3000${book.owner.avatar}` : "/default-avatar.png"}
                alt={`Avatar de ${book.owner.name}`}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: 8,
                }}
              />
              <p>Dono: {book.owner.name}</p>
            </div>
            {usuarioLogado && book.ownerId !== usuarioLogado.id ? (
              <button>{book.type === "venda" ? "Comprar" : "Doar"}</button>
            ) : (
              <button disabled>Seu livro</button>
            )}
          </div>
        ))}
      </div>

      <footer className="footer-shopee">
        <p>📚 DoaLivro &copy; 2025</p>
      </footer>
    </div>
  );
}