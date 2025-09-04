import { useEffect, useState } from "react";
import "../css/Home.css";

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function Home() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuario = parseJwt(token);
    setUsuarioLogado(usuario);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/books", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuarioLogado(null);
    window.location.reload();
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
      {/* Navbar */}
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
            <>
              <button onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <span>Não logado</span>
          )}
        </div>
      </nav>

      {/* Filtros */}
      <div className="filters-shopee">
        <button onClick={() => setFilter("all")} className={filter === "all" ? "active" : ""}>Todos</button>
        <button onClick={() => setFilter("venda")} className={filter === "venda" ? "active" : ""}>Venda</button>
        <button onClick={() => setFilter("doacao")} className={filter === "doacao" ? "active" : ""}>Doação</button>
      </div>

      {/* Grid de livros */}
      <div className="book-grid-shopee">
        {filteredBooks.map(book => (
          <div className="book-card-shopee" key={book.id}>
            <div className="book-image">📖</div>
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p>{book.type === "venda" ? `R$ ${book.price}` : "Doação"}</p>
            <p>Dono: {book.owner.name}</p>
            {usuarioLogado && book.ownerId !== usuarioLogado.id ? (
              <button>{book.type === "venda" ? "Comprar" : "Doar"}</button>
            ) : (
              <button disabled>Seu livro</button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer-shopee">
        <p>📚 DoaLivro &copy; 2025</p>
      </footer>
    </div>
  );
}
