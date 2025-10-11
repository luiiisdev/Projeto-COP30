import { useState } from "react";
import "../css/AddBookPage.css";

import { useNavigate } from "react-router-dom";

export default function AddBook({ token, onAdd }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("doacao");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author || !type) return alert("Preencha todos os campos!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("type", type);
    if (type === "venda") formData.append("price", price);
    if (file) formData.append("image", file);

    try {
      const res = await fetch("http://localhost:3000/books", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Erro ao adicionar livro");

      onAdd(data.book);
      navigate("/");
    } catch (err) {
      console.error("ERRO FRONTEND:", err);
      alert("Erro ao adicionar livro");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-book-shopee">
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Autor"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
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
        />
      )}
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit">Adicionar Livro</button>
    </form>
  );
}
