"use client";

import { Building2, TrendingUp } from "lucide-react";
import { ProyectoInvertidoType } from "@/types/proyecto";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

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
  showPerformance?: boolean;
}

export default function InvestedProjectCardDetailed({ 
  proyecto, 
  showPerformance = true 
}: InvestedProjectCardDetailedProps) {
  const router = useRouter();
  
  // Generar índice aleatorio pero estable para este proyecto específico
  // Usamos el ID del proyecto para que siempre tenga el mismo color
  const colorIndex = proyecto.proyecto_id % bgColors.length;
  const bgColor = bgColors[colorIndex];
  const iconColor = iconColors[colorIndex];
  
  // Formatear el monto con separadores de miles
  const montoFormateado = parseFloat(proyecto.monto_invertido).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  // Generación de datos de rendimiento simulados
  const randomPerformance = Math.random() > 0.2 ? 
    (5 + Math.random() * 20).toFixed(1) : // Rendimiento positivo común
    (-5 - Math.random() * 5).toFixed(1);  // Rendimiento negativo menos común
    
  const isPositivePerformance = parseFloat(randomPerformance) > 0;
  
  // Valor actual simulado basado en el rendimiento
  const valorActual = parseFloat(proyecto.monto_invertido) * (1 + parseFloat(randomPerformance) / 100);
  const valorActualFormateado = valorActual.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  // Financiamiento aleatorio entre 40% y 95%
  const financiamiento = 40 + Math.floor(Math.random() * 55);
  
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
          <p className="text-sm text-gray-600">{proyecto.descripcion.slice(0, 40)}...</p>
          <p className="text-sm text-gray-600">
            Invertido: {montoFormateado}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Progress value={financiamiento} className="w-20 h-2" />
            <span className="text-xs text-gray-500">{financiamiento}% financiado</span>
          </div>
        </div>
      </div>
      
      {showPerformance && (
        <div className="text-right">
          <div className={`text-lg font-semibold flex items-center justify-end ${
            isPositivePerformance ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`mr-1 ${isPositivePerformance ? '' : 'transform rotate-180'} h-4 w-4`} />
            {isPositivePerformance ? '+' : ''}{randomPerformance}%
          </div>
          <div className="text-sm text-gray-600">{valorActualFormateado}</div>
        </div>
      )}
    </div>
  );
}
