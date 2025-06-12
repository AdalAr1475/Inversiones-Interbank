"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      // Si no hay token, redirige al login
      router.push("/auth/login");
      return;
    }

    try {
        
      interface DecodedToken {
        id: number
        sub: string
        tipo_usuario: string
        exp: number
      }

      const decodedToken = jwtDecode<DecodedToken>(token)  
      const currentTime = Date.now() / 1000;

      // Verificar si el token ha expirado
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        router.push("/auth/login");
        return;
      }

      // Verificar si el rol del usuario coincide con el requerido
      if (decodedToken.tipo_usuario !== requiredRole) {
        router.push("/auth/login");
        return;
      }

    } catch (error) {
      console.error("Error decoding token", error);
      router.push("/auth/login");
    }
  }, [token, requiredRole, router]);

  return <>{children}</>;
};

export default ProtectedRoute;
