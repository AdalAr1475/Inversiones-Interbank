"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      // Si no hay token, redirige al login
      redirect("/auth/login");
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
        redirect("/auth/login");
      }

      // Verificar si el rol del usuario coincide con el requerido
      if (decodedToken.tipo_usuario !== requiredRole) {
        if (decodedToken.tipo_usuario == "empresa") {
          redirect("/dashboard/empresa");
        }
        else {
          redirect("/dashboard/inversor");
        }
      }

    } catch (error) {
      console.error("Error decoding token", error);
      redirect("/auth/login");
    }
  }, [token, requiredRole]);

  return <>{children}</>;
};

export default ProtectedRoute;
