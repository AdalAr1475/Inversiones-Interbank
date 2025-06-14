"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProyectosInvertidos } from "@/api/proyectos";
import { ProyectoInvertidoType } from "@/types/proyecto";
import InvestedProjectCardDetailed from "./invested-project-card-detailed";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface DecodedToken {
  id: number;
  sub: string;
  tipo_usuario: string;
  exp: number;
}

export default function MisInversionesSection() {
  const [proyectosInvertidos, setProyectosInvertidos] = useState<ProyectoInvertidoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchProyectosInvertidos = async () => {
      setIsLoading(true);
      
      try {
        // Verificar si estamos en el navegador
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem("token");
          if (!token) {
            setError("No se encontró el token de autenticación");
            setIsLoading(false);
            return;
          }
          
          // Decodificar token para obtener el ID del usuario
          const decodedToken = jwtDecode<DecodedToken>(token);
          const usuarioId = decodedToken.id;
          
          try {
            // Obtener proyectos invertidos
            const proyectos = await getProyectosInvertidos(usuarioId, token);
            
            setProyectosInvertidos(proyectos);
            setError(null);
          } catch (apiError) {
            console.error("Error en la API al obtener proyectos invertidos:", apiError);
            
            // Si hay un error en la API, podemos mostrar datos de ejemplo para desarrollo
            // Descomentar las siguientes líneas en producción
            const proyectosEjemplo: ProyectoInvertidoType[] = [
              {
                proyecto_id: 1,
                titulo: "TechFuture AI",
                descripcion: "Plataforma de inteligencia artificial para predicción de mercados",
                monto_invertido: "15000",
                fecha_inversion: new Date().toISOString(),
                estado: "Activa"
              },
              {
                proyecto_id: 2,
                titulo: "EcoSolutions",
                descripcion: "Soluciones sostenibles para la industria energética",
                monto_invertido: "25000",
                fecha_inversion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                estado: "En progreso"
              }
            ];
            
            setProyectosInvertidos(proyectosEjemplo);
            setError("Usando datos de ejemplo para desarrollo. La API podría estar caída.");
          }
        }
      } catch (err) {
        console.error("Error al procesar la información del usuario:", err);
        setError("Error al cargar los proyectos invertidos. Por favor, inténtelo nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProyectosInvertidos();
  }, []);
  
  const handleExploreOpportunities = () => {
    router.push("/oportunidades");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Inversiones</CardTitle>
        <CardDescription>Estado actual de tus inversiones activas</CardDescription>
      </CardHeader>
      <CardContent>        {isLoading ? (
          <div className="flex flex-col justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Cargando tus inversiones...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>        ) : proyectosInvertidos.length > 0 ? (
          <div className="space-y-4">
            {proyectosInvertidos.map((proyecto) => (
              <InvestedProjectCardDetailed 
                key={`${proyecto.proyecto_id}-${proyecto.fecha_inversion}`} 
                proyecto={proyecto} 
              />
            ))}
          </div>
        ) : (          <div className="text-center p-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 6a1 1 0 011 1v3a1 1 0 01-2 0V7a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Tu portafolio está vacío</h3>
            <p className="text-gray-600 mb-6">¡Está vacío! ¿Por qué no pruebas en invertir en alguno de nuestros proyectos?</p>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white" 
              onClick={handleExploreOpportunities}
            >
              Explorar Oportunidades
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
