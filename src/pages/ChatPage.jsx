import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ChatPage() {
  const { id } = useParams(); // conversationId
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUserName, setOtherUserName] = useState("");
  const token = localStorage.getItem("token");

  // Decodificar token uma vez
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  const fetchMessages = async () => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3000/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Encontra a conversa específica
      const conv = data.find(c => c.id === parseInt(id));
      if (conv) {
        setMessages(conv.messages || []);

        // Define o nome do outro usuário
        if (conv.buyer.id === userId) {
          setOtherUserName(conv.seller.name);
        } else {
          setOtherUserName(conv.buyer.name);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // atualização em tempo real
    return () => clearInterval(interval);
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await fetch(`http://localhost:3000/conversations/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content: newMessage })
    });

    setNewMessage("");
    fetchMessages();
  };

  if (loading) return <p>Carregando chat...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat com {otherUserName}</h2>
      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #8d6e63", padding: 10, borderRadius: 8 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: 5 }}>
            <strong>{msg.senderId === userId ? "Você" : otherUserName}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          style={{ width: "80%", padding: 8, borderRadius: 5, border: "1px solid #ccc" }}
        />
        <button
          onClick={sendMessage}
          style={{ padding: 8, marginLeft: 5, borderRadius: 5, backgroundColor: "#ffab40", border: "none", color: "white" }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
