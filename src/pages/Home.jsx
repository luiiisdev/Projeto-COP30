import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Carrega usuário logado
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3000/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUsuarioLogado(data));
  }, [token]);

  // Carrega livros
  useEffect(() => {
    fetch("http://localhost:3000/books", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => res.json())
      .then(data => setBooks(data));
  }, [token]);

  // Carrega carrinho do localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const filteredBooks = books
    .filter(b => filter === "all" || b.type === filter)
    .filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (book) => {
    setCart(prev => {
      const newCart = [...prev, book];
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  return (
    <div className="home-shopee">
      <nav className="navbar-shopee">
        <img src="/logo site.png" alt="DoaFolha Logo" className="navbar-logo" />
        <input
          className="search-bar"
          type="text"
          placeholder="Pesquisar livros..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="user-info-shopee">
          {usuarioLogado && (
            <>
              <button onClick={() => navigate("/add-book")}>➕ Adicionar Livro</button>
              <button onClick={() => navigate("/cart")}>
                🛒 Carrinho ({cart.length})
              </button>
              <img
                src={usuarioLogado.avatar ? `http://localhost:3000${usuarioLogado.avatar}` : "/default-avatar.png"}
                alt="Avatar"
                onClick={() => navigate("/perfil")}
                style={{ cursor: "pointer", marginLeft: "10px" }}
              />
            </>
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
          <div key={book.id} className="book-card-shopee">
            <div className="book-image">
              {book.image ? (
                <img src={`http://localhost:3000${book.image}`} alt={book.title} />
              ) : (
                <p>📖</p>
              )}
            </div>
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            <p>{book.type === "venda" ? `R$ ${book.price}` : "Doação"}</p>
            <div
              className="book-owner-info"
              onClick={() => navigate(`/users/${book.owner.id}`)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={book.owner.avatar ? `http://localhost:3000${book.owner.avatar}` : "/default-avatar.png"}
                alt={book.owner.name}
              />
              <p>Dono: {book.owner.name}</p>
            </div>
            <button onClick={() => addToCart(book)}>🛒 Adicionar ao carrinho</button>
          </div>
        ))}
      </div>

      <footer className="footer-shopee">
        <p>📚 DoaFolha &copy; 2025</p>
      </footer>
    </div>
  );
}
