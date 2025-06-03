import { createContext, useState, type ReactNode, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>
  fetchWithAuth: (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<Response>
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
  login: async () => {
    throw new Error("login no implementado");
  },
  fetchWithAuth: async () => {
    throw new Error("fetchWithAuth no implementado");
  },
});

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp viene en segundos, convertir a ms
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch {
    return true;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("token")
  );

  const navigate = useNavigate();

  // Mantener localStorage sincronizado con estado
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token]);

  const logout = useCallback(() => {
    setTokenState(null);
    navigate("/login");
  }, [navigate]);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
  }, []);

  // Nueva función login dentro del contexto
  const login = useCallback(
    async (email: string, password: string) => {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Autenticación Fallida!");
      }

      const data = await response.json();
      setToken(data.access_token);
      navigate("/dashboard");
    },
    [navigate, setToken]
  );

  // fetch con autorización y manejo de 401
  const fetchWithAuth = useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      if (!token) {
        logout();
        throw new Error("No autenticado");
      }

      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${token}`);

      const response = await fetch(input, {
        ...init,
        headers,
      });

      if (response.status === 401) {
        // Token inválido o expirado
        logout();
        throw new Error("Sesión expirada. Por favor inicie sesión nuevamente.");
      }

      return response;
    },
    [token, logout]
  );

  return (
    <AuthContext.Provider value={{ token, setToken, logout, login, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
