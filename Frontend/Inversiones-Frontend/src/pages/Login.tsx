import React, { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import "./Login.css";

function LoginPage() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validarForm = () => {
    if (!email || !password) {
      setError("Ingresar su email y contraseña")
      return false
    }
    setError("")
    return true
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validarForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      // El navigate se hace dentro del login en el contexto
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Un error ha ocurrido. Por favor intentelo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contenedor">
      <div className="left-side">
        <form className="Formulario" onSubmit={handleLogin}>
          
          <h1>BIENVENIDOS</h1>
          <div className="input-group">
            <div className="icon-box">
              <span className="icon user-icon">👤</span>
            </div>
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
            />
          </div>

          <div className="input-group">
            <div className="icon-box">
              <span className="icon lock-icon">🔒</span>
            </div>
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
        
        {error && <p>{error}</p>}

        <a
          href="https://github.com/AdalAr1475/Inversiones-Interbank"
          target="_blank"
          rel="noopener noreferrer"
          className="github-icon"
        >
          <i className="fab fa-github"></i>
        </a>
      </div>
      <div className="right-side">
        <img
          src="https://marketplace.canva.com/EAE6q2OJlag/1/0/1600w/canva-bonito-logotipo-check-seguridad-degradado-3d-verde-fpNeVH30nSQ.jpg"
          alt="Imagen"
        />
      </div>
    </div>
  );
}

export default LoginPage