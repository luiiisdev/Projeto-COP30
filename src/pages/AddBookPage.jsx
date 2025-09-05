import { useNavigate } from "react-router-dom";
import AddBook from "../components/AddBook";

export default function AddBookPage() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token) {
    navigate("/"); // redireciona se não estiver logado
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <AddBook
        token={token}
        onAdd={(newBook) => {
          alert("Livro adicionado com sucesso!");
          navigate("/"); // volta para a Home após adicionar
        }}
      />
    </div>
  );
}
