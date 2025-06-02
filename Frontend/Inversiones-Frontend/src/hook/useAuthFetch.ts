import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuthFetch() {
  const { token, logout } = useContext(AuthContext);

  async function authFetch(input: RequestInfo, init?: RequestInit) {
    const headers = new Headers(init?.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(input, { ...init, headers });

    if (response.status === 401) {
      logout();
      throw new Error("Sesión expirada, por favor inicia sesión de nuevo");
    }

    return response;
  }

  return authFetch;
}
