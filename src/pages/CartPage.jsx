import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Cart.css"; // <-- importa o CSS

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3000/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUsuarioLogado(data);
        const savedCart = JSON.parse(localStorage.getItem(`cart_${data.id}`) || "[]");
        setCart(savedCart);
      })
      .catch(() => navigate("/login"));
  }, [navigate, token]);

  const removeFromCart = (bookId) => {
    const newCart = cart.filter(b => b.id !== bookId);
    setCart(newCart);
    if (usuarioLogado) localStorage.setItem(`cart_${usuarioLogado.id}`, JSON.stringify(newCart));
  };

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
        localStorage.removeItem(`cart_${usuarioLogado.id}`);
        setCart([]);
        setAddress("");
        navigate("/");
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
      <div className="empty-cart">
        <h2>Seu carrinho está vazio 😢</h2>
        <button onClick={() => navigate("/")}>Voltar para a Home</button>
      </div>
    );
  }

  const total = cart.reduce((sum, b) => sum + (b.price || 0), 0);

  return (
    <div className="cart-container">
      <h2>Seu Carrinho</h2>
      <div className="cart-items">
        {cart.map(book => (
          <div key={book.id} className="cart-item">
            <img
              src={book.image ? `http://localhost:3000${book.image}` : "/default-avatar.png"}
              alt={book.title}
            />
            <div className="cart-item-info">
              <p><strong>{book.title}</strong> - {book.author}</p>
              <p>{book.type === "venda" ? `R$ ${book.price}` : "Doação"}</p>
            </div>
            <button onClick={() => removeFromCart(book.id)}>❌</button>
          </div>
        ))}
      </div>

      <div className="cart-address">
        <label>
          Endereço de entrega:
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </label>
      </div>

      <div className="cart-total">Total: R$ {total.toFixed(2)}</div>

      <button
        className="checkout-button"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Finalizando..." : "Finalizar Compra"}
      </button>
    </div>
  );
}
