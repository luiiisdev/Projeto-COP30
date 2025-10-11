import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Pega o id do usuário logado do token
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  useEffect(() => {
    if (!token) return navigate("/login");

    fetch("http://localhost:3000/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setConversations(data);
        setLoading(false);
      });
  }, [token, navigate]);

  if (loading) return <p>Carregando conversas...</p>;
  if (conversations.length === 0) return <p>Nenhuma conversa ainda.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Conversas</h2>
      <div>
        {conversations.map(conv => {
          const otherUser = conv.buyer.id === userId ? conv.seller : conv.buyer;

          return (
            <div
              key={conv.id}
              style={{
                border: "1px solid #8d6e63",
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
                cursor: "pointer"
              }}
              onClick={() => navigate(`/conversations/${conv.id}`)}
            >
              <p><strong>{otherUser.name}</strong></p>
              <p>
                Última mensagem: {conv.messages.length 
                  ? conv.messages[conv.messages.length - 1].content 
                  : "Sem mensagens ainda"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
