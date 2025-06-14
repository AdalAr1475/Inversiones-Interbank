"use client";

import { Building2 } from "lucide-react";
import { ProyectoInvertidoType } from "@/types/proyecto";
import { useRouter } from "next/navigation";

// Colores para los iconos de los proyectos (para selección aleatoria)
const bgColors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-purple-100",
  "bg-orange-100", 
  "bg-red-100",
  "bg-yellow-100",
  "bg-indigo-100",
  "bg-pink-100",
  "bg-teal-100"
];

const iconColors = [
  "text-blue-600",
  "text-green-600",
  "text-purple-600",
  "text-orange-600",
  "text-red-600",
  "text-yellow-600",
  "text-indigo-600",
  "text-pink-600",
  "text-teal-600"
];

interface InvestedProjectCardProps {
  proyecto: ProyectoInvertidoType;
}

export default function InvestedProjectCard({ proyecto }: InvestedProjectCardProps) {
  const router = useRouter();
  
  // Generar índice aleatorio pero estable para este proyecto específico
  // Usamos el ID del proyecto para que siempre tenga el mismo color
  const colorIndex = proyecto.proyecto_id % bgColors.length;
  const bgColor = bgColors[colorIndex];
  const iconColor = iconColors[colorIndex];
  
  // Formatear fecha para mostrar de forma legible
  const fechaFormateada = new Date(proyecto.fecha_inversion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Formatear el monto con separadores de miles
  const montoFormateado = parseFloat(proyecto.monto_invertido).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  // Manejar el clic en la tarjeta para navegar al detalle del proyecto
  const handleClick = () => {
    router.push(`/oportunidades/${proyecto.proyecto_id}`);
  };
  
  return (
    <div 
      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Building2 className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <h3 className="font-semibold">{proyecto.titulo}</h3>
          <p className="text-sm text-gray-600">
            {proyecto.estado} • Invertido: {montoFormateado}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {fechaFormateada}
          </p>
        </div>
      </div>
    </div>
  );
}
