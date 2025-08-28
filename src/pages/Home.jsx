import { useEffect, useState } from "react";
import "../css/Home.css";

export default function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3000/books", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  return (
    <div className="home-container">
      <h2>Lista de Livros</h2>
      {books.length > 0 ? (
        <ul className="books-list">
          {books.map((book, i) => (
            <li key={i} className="book-item">
              {book.title} - {book.author} ({book.type})
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-books">Nenhum livro encontrado ou faça login primeiro.</p>
      )}
    </div>
  );
}
