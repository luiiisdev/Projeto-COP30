import { useEffect, useState } from "react";
import "../css/Home.css";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("doacao");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  // carregar livros
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/books", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setBooks(data));
  };

  // cadastrar livro
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          author,
          type,
          price: type === "venda" ? parseFloat(price) : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Livro cadastrado com sucesso!");
        setTitle("");
        setAuthor("");
        setType("doacao");
        setPrice("");
        fetchBooks(); // recarrega a lista
      } else {
        setMessage(data.error || "Erro ao cadastrar livro");
      }
    } catch (err) {
      setMessage("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="home-container">
      <h2>Lista de Livros</h2>

      {books.length > 0 ? (
        <ul className="books-list">
          {books.map((book, i) => (
            <li key={i} className="book-item">
              {book.title} - {book.author} ({book.type}
              {book.type === "venda" && book.price ? ` - R$ ${book.price}` : ""})
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-books">
          Nenhum livro encontrado ou faça login primeiro.
        </p>
      )}

      <h2>Cadastrar Novo Livro</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="book-form">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Autor"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="doacao">Doação</option>
          <option value="venda">Venda</option>
        </select>

        {type === "venda" && (
          <input
            type="number"
            placeholder="Preço"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            required
          />
        )}

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
