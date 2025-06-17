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

interface InvestedProjectCardDetailedProps {
  proyecto: ProyectoInvertidoType;
}

export default function InvestedProjectCardDetailed({ 
  proyecto
}: InvestedProjectCardDetailedProps) {
  const router = useRouter();
  
  // Generar índice aleatorio pero estable para este proyecto específico
  // Usamos el ID del proyecto para que siempre tenga el mismo color
  const colorIndex = proyecto.proyecto_id % bgColors.length;
  const bgColor = bgColors[colorIndex];
  const iconColor = iconColors[colorIndex];
  // Formatear el monto con separadores de miles
  // Asegurarnos de que montoInvertido sea un número correctamente parseado
  const montoInvertido = parseFloat(proyecto.monto_invertido);
  
  // Formateo del monto invertido para mostrar
  const montoFormateado = montoInvertido.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
    // Calcular la proyección de ganancia anual
  const calcularProyeccion = () => {
    if (!proyecto.retorno_estimado) return null;
    
    // Cálculo de ganancia proyectada basada en el retorno estimado
    // Aseguramos precisión en el cálculo usando números flotantes
    const gananciaProyectada = montoInvertido * (proyecto.retorno_estimado / 100);
    
    // Formatear la ganancia proyectada, mostrando decimales cuando el valor es pequeño
    return gananciaProyectada.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: gananciaProyectada < 10 ? 2 : 0,
      maximumFractionDigits: gananciaProyectada < 10 ? 2 : 0
    });
  };
  
  const gananciaAnual = calcularProyeccion();
  
  // Manejar el clic en la tarjeta para navegar al detalle del proyecto
  const handleClick = () => {
    router.push(`/oportunidades/${proyecto.proyecto_id}`);
  };
  return (
    <div 
      className="p-5 border rounded-lg cursor-pointer hover:shadow-lg transition-all hover:border-blue-200 bg-white"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mr-3 shadow-sm`}>
            <Building2 className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h3 className="font-semibold text-gray-800">{proyecto.titulo}</h3>
        </div>
        
        {proyecto.retorno_estimado && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 shadow-sm">
            <span className="mr-1 text-blue-500">↗</span>
            <span className="font-bold">{proyecto.retorno_estimado}%</span> ROI Est.
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600">
          <span className="inline-block bg-gray-50 px-2 py-1 rounded text-gray-500 border border-gray-100">
            {new Date(proyecto.fecha_inversion).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        <div className="font-bold text-lg text-green-600">{montoFormateado}</div>
      </div>
        {/* Gancho de proyección de ganancia */}
      {gananciaAnual && (
        <div className="mt-3 p-2 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-green-800">
              Proyección anual
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-1 text-green-600">+</span>
              <span className="font-bold text-green-700">{gananciaAnual}</span>
            </div>
          </div>
          <div className="text-xs text-green-600 mt-1">
            Ganancia esperada manteniendo tu inversión
          </div>
          <div className="text-xs text-emerald-700/70 mt-1 flex items-center">
            <span className="mr-1">•</span>
            {proyecto.retorno_estimado}% sobre {parseFloat(proyecto.monto_invertido).toLocaleString('es-ES', {style: 'currency', currency: 'USD', minimumFractionDigits: 2})}
          </div>
        </div>
      )}
    </div>
  );
}
