import { createContext, useState, type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const navigate = useNavigate();

  // Mantener localStorage sincronizado con estado
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const logout = () => {
    setToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
