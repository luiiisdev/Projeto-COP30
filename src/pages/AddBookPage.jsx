import { useNavigate } from "react-router-dom";
import AddBook from "../components/AddBook";


export default function AddBookPage() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token) {
    navigate("/");
  }

  return (

    <div className="add-book-container">
      <AddBook
        token={token}
        onAdd={(newBook) => {
          alert("Livro adicionado com sucesso!");
          navigate("/");
        }}
      />
    </div>
  );
}