import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

const Usuarios = () => {
  const { fetchWithAuth } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await fetchWithAuth("http://localhost:8000/users/get-usuarios");
        const text = await response.text();
        
        if (!response.ok) {
          try {
            const data = JSON.parse(text);
            throw new Error(data.detail || "Error desconocido");
          } catch {
            // Si no es JSON válido, lanza el texto completo
            throw new Error(text);
          }
        }

        const data = JSON.parse(text);
        setUsuarios(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuarios();
  }, [fetchWithAuth]);

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <table border={1} cellPadding={5} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Usuarios;
