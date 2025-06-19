"use client";
import { Building2 } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

// Este es un mock para simular si el usuario está autenticado
// Después se reemplazará con la lógica real de autenticación
const useAuth = () => {
  const pathname = usePathname();
  // Asumimos que si la ruta incluye /dashboard, el usuario está autenticado
  const isAuthenticated = pathname?.includes('/dashboard');
  // Mock de datos del usuario cuando está autenticado
  const userData = isAuthenticated ? {
    name: "Usuario",
    company: pathname?.includes('/empresa') ? "TechStart AI" : null,
    avatar: "U",
    avatarColor: "bg-blue-600"
  } : null;
  
  return { isAuthenticated, user: userData };
};
  
interface DecodedToken {
  id: number
  email: string
  tipo_usuario: string
  exp: number
}

export default function Header() {    
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const { isAuthenticated, user } = useAuth();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedToken = window.localStorage.getItem("token");
        setToken(storedToken);
      }
    }, []);

    const handleLogin = () => {
      if(token) {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if(decodedToken.tipo_usuario==="emprendedor"){
          redirect("/dashboard/emprendedor")
        } else {
          redirect("/dashboard/inversor")

        }
      }
      else{
        redirect("/auth/login")
      }
    }
    
    const handleRegister = () => {
      if(token) {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if(decodedToken.tipo_usuario==="emprendedor"){
          redirect("/dashboard/emprendedor")
        } else {
          redirect("/dashboard/inversor")
        }
      }
      else{
        redirect("/auth/register")
      }
    }
    
    return (
        <header className="border-b border-green-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Link href={isAuthenticated ? "/dashboard" : "/"}>
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </Link>
              <Link href={isAuthenticated ? "/dashboard" : "/"} className="text-green-800 hover:text-green-600">
                <span className="text-2xl font-bold font-primary">Ensigna</span>
              </Link>
            </div>
            
            {/* Navegación para usuarios no autenticados en la página de inicio */}
            {isHomePage && !isAuthenticated && (
              <nav className="hidden md:flex space-x-8">
                <a
                  href="#como-funciona"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Cómo Funciona
                </a>
                <a
                  href="#oportunidades"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Oportunidades
                </a>
                <a
                  href="#testimonios"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Testimonios
                </a>
                <a
                  href="#contacto"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Contacto
                </a>
              </nav>
            )}
            
            {/* Navegación para usuarios autenticados */}
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/oportunidades" className="text-gray-600 hover:text-green-600 transition-colors">
                  Oportunidades
                </Link>
                <Link href="/dashboard/mensajes" className="text-gray-600 hover:text-green-600 transition-colors">
                  Mensajes
                </Link>
              </nav>
            )}
            
            {/* Botones de acción según estado de autenticación */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {user?.company && (
                    <span className="text-gray-600 hidden md:inline-block">{user.company}</span>
                  )}
                  <Link href="/profile">
                    <div className={`w-8 h-8 ${user?.avatarColor || "bg-blue-600"} rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity`}>
                      {user?.avatar || "U"}
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-green-600 shadow cursor-pointer hover:text-green-700"
                    onClick={handleLogin}
                  >
                    Iniciar Sesión
                  </Button>
                
                  <Button 
                    className="bg-green-600 hover:bg-green-700 shadow cursor-pointer text-white"
                    onClick={handleRegister}
                  >
                    Registrarse
                  </Button> 
                </>
              )}
            </div>
          </div>
        </div>
    </header>)
}
