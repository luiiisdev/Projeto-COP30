import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [books, setBooks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [showPurchases, setShowPurchases] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  useEffect(() => {
    if (!token) return navigate("/login");
    fetch("http://localhost:3000/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsuario(data))
      .catch(() => navigate("/login"));
  }, [navigate, token]);

  useEffect(() => {
    if (!token || showPurchases) return;
    fetch("http://localhost:3000/books/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error(err));
  }, [token, showPurchases]);

  useEffect(() => {
    if (!token || !showPurchases) return;
    fetch("http://localhost:3000/orders/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setPurchases(data))
      .catch(err => console.error(err));
  }, [token, showPurchases]);

  const handleDelete = async bookId => {
    if (!window.confirm("Tem certeza que deseja apagar este livro?")) return;
    try {
      await fetch(`http://localhost:3000/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter(book => book.id !== bookId));
    } catch (error) {
      console.error("Erro ao deletar livro:", error);
    }
  };

  const handleAvatarSelect = e => {
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
      setUsuario(prev => ({ ...prev, avatar: data.avatar }));
      setSelectedAvatar(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleHome = () => navigate("/");

  const togglePurchases = () => {
    setShowPurchases(prev => !prev);
  };

  const markAsDelivered = async orderId => {
    try {
      const res = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "DELIVERED" }),
      });

      if (!res.ok) throw new Error("Falha ao atualizar status");
      const updatedOrder = await res.json();

      // Atualiza o estado local em tempo real, sem recarregar
      setPurchases(prev =>
        prev.map(order =>
          order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order
        )
      );
    } catch (err) {
      console.error("Erro ao marcar como entregue:", err);
      alert("Erro ao marcar como entregue.");
    }
  };

  if (!usuario) return <p className="loading">Carregando...</p>;

  return (
    <div className="profile-page">
      <nav className="navbar-profile">
        <img src="/logo site.png" alt="DoaFolha Logo" className="navbar-logo" />
        <button className="btn-back" onClick={handleHome}>
          Voltar
        </button>
      </nav>

      <div className="profile-container">
        <div className="profile-header">
          <label className="avatar-label">
            <img
              src={
                previewAvatar ||
                (usuario.avatar ? `http://localhost:3000${usuario.avatar}` : "/default-avatar.png")
              }
              alt="Avatar"
              className="profile-avatar"
            />
            <input type="file" onChange={handleAvatarSelect} style={{ display: "none" }} />
          </label>

          {selectedAvatar && (
            <button
              className="btn-save-avatar"
              onClick={handleAvatarSave}
              disabled={uploading}
            >
              {uploading ? "Salvando..." : "Salvar Avatar"}
            </button>
          )}

          <h2>{usuario.name}</h2>
          <p>{usuario.email}</p>

          <button className="btn-purchases" onClick={togglePurchases}>
            {showPurchases ? "Fechar Compras" : "Ver Compras"}
          </button>
        </div>

        {!showPurchases ? (
          <>
            <h3>Seus Livros</h3>
            <div className="book-grid-profile">
              {books.length === 0 && <p>Você ainda não adicionou livros.</p>}
              {books.map(book => (
                <div className="book-card-profile" key={book.id}>
                  <div className="book-image">
                    {book.image ? (
                      <img src={`http://localhost:3000${book.image}`} alt={book.title} />
                    ) : (
                      "📖"
                    )}
                  </div>
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <p>{book.type === "venda" ? `R$ ${book.price}` : "Doação"}</p>
                  <button className="delete-button" onClick={() => handleDelete(book.id)}>
                    Apagar
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3>Suas Compras</h3>
            <div className="book-grid-profile">
              {purchases.length === 0 && <p>Você ainda não realizou compras.</p>}
              {purchases.map(order =>
                order.items.map(item => (
                  <div className="book-card-profile" key={item.id}>
                    <div className="book-image">
                      {item.bookImage ? (
                        <img src={`http://localhost:3000${item.bookImage}`} alt={item.bookName} />
                      ) : (
                        "📖"
                      )}
                    </div>
                    <h3>{item.bookName}</h3>
                    <p>Autor: {item.bookAuthor || "Desconhecido"}</p>
                    <p>Preço: R$ {item.price}</p>
                    <p>Status: {order.status}</p>
                    {order.status !== "DELIVERED" && (
                      <button
                        className="btn-finish"
                        onClick={() => markAsDelivered(order.id)}
                      >
                        Marcar como concluído
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <button className="btn-logout" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </div>
  );
}
