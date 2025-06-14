"use client";

import { useEffect, useState } from "react";
import { getAllProyectos, ProyectoResumen } from "@/api/proyectos";
import { Button } from "@/components/ui/button";
import CardInvest from "@/components/card-invest";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function NuevasOportunidadesSection() {
  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchProyectos = async () => {
      setIsLoading(true);
      
      try {
        // Obtener proyectos de la API
        const data = await getAllProyectos();
        
        // Ordenar por ID (asumiendo que los más nuevos tienen ID mayor)
        const sortedProyectos = [...data].sort((a, b) => b.id - a.id);
        
        // Tomar solo los 3 primeros proyectos
        const topProyectos = sortedProyectos.slice(0, 3);
        
        setProyectos(topProyectos);
        setError(null);
      } catch (err) {
        console.error("Error al obtener proyectos:", err);
        setError("Error al cargar las oportunidades. Por favor, inténtelo nuevamente.");
        
        // Datos de ejemplo para desarrollo
        setProyectos([
          {
            id: 1,
            categoria: "Tecnología",
            titulo: "SmartTech AI",
            descripcion: "Plataforma de inteligencia artificial para optimización de procesos",
            meta: 800000,
            recaudado: 350000,
            inversores: 28
          },
          {
            id: 2,
            categoria: "Sostenibilidad",
            titulo: "GreenEnergy",
            descripcion: "Soluciones de energía renovable para comunidades rurales",
            meta: 500000,
            recaudado: 325000,
            inversores: 42
          },
          {
            id: 3,
            categoria: "Salud",
            titulo: "MedInnovate",
            descripcion: "Dispositivos médicos innovadores para diagnóstico temprano",
            meta: 600000,
            recaudado: 180000,
            inversores: 19
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProyectos();
  }, []);

  const handleVerMasOportunidades = () => {
    router.push("/oportunidades");
  };
  
  // Función para añadir una calificación visual a cada proyecto
  const getRating = (proyecto: ProyectoResumen) => {
    // Simulación de rating basado en el porcentaje financiado y número de inversores
    const porcentaje = proyecto.recaudado / proyecto.meta;
    // Base rating entre 3.8 y 5.0
    return Math.min(5.0, Math.max(3.8, 4.0 + porcentaje * 0.5 + (proyecto.inversores / 50) * 0.5)).toFixed(1);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Nuevas Oportunidades</h2>
        <Button 
          variant="link" 
          onClick={handleVerMasOportunidades}
          className="text-green-600 hover:text-green-800"
        >
          Ver todas
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : error && proyectos.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">{error}</p>
          <Button 
            className="mt-4 bg-green-600 hover:bg-green-700 text-white" 
            onClick={() => setIsLoading(true)}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map(proyecto => (
            <div key={proyecto.id} className="relative">
              {/* Badge de rating */}
              <div className="absolute top-4 right-4 z-10 flex items-center bg-white rounded-full px-2 py-1 shadow-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">{getRating(proyecto)}</span>
              </div>
              
              <Link href={`/oportunidades/${proyecto.id}`}>
                <CardInvest 
                  category={proyecto.categoria}
                  title={proyecto.titulo}
                  description={proyecto.descripcion}
                  goal={proyecto.meta}
                  raised={proyecto.recaudado}
                  investors={proyecto.inversores}
                />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
