import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Carrega usuário logado
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3000/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsuarioLogado(data))
      .catch(() => navigate("/"));
  }, [navigate, token]);

  // Carrega carrinho
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  // Remove livro do carrinho
  const removeFromCart = (bookId) => {
    const newCart = cart.filter(b => b.id !== bookId);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // Finaliza compra
  const handleCheckout = async () => {
    if (!address) return alert("Informe o endereço de entrega");
    if (!usuarioLogado) return alert("Usuário não autenticado");
    if (cart.length === 0) return alert("Carrinho vazio");

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookIds: cart.map(b => b.id),
          address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Compra realizada com sucesso!");
        localStorage.removeItem("cart");
        setCart([]);
        setAddress("");
        navigate("/"); // volta para a Home
      } else {
        alert(data.error || "Erro ao finalizar compra");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar compra");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Seu carrinho está vazio 😢</h2>
        <button onClick={() => navigate("/")}>Voltar para a Home</button>
      </div>
    );
  }

  // Calcula total
  const total = cart.reduce((sum, b) => sum + (b.price || 0), 0);

  return (
    <div style={{ padding: 20 }}>
      <h2>Seu Carrinho</h2>
      <div>
        {cart.map(book => (
          <div key={book.id} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <img
              src={book.image ? `http://localhost:3000${book.image}` : "/default-avatar.png"}
              alt={book.title}
              width={80}
              style={{ marginRight: 10 }}
            />
            <div style={{ flex: 1 }}>
              <p><strong>{book.title}</strong> - {book.author}</p>
              <p>{book.type === "venda" ? `R$ ${book.price}` : "Doação"}</p>
            </div>
            <button onClick={() => removeFromCart(book.id)}>❌ Remover</button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <label>
          Endereço de entrega:
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{ width: "100%", marginTop: 5 }}
          />
        </label>
      </div>

      <h3 style={{ marginTop: 20 }}>Total: R$ {total.toFixed(2)}</h3>

      <button onClick={handleCheckout} disabled={loading} style={{ marginTop: 20 }}>
        {loading ? "Finalizando..." : "Finalizar Compra"}
      </button>
    </div>
  );
}
