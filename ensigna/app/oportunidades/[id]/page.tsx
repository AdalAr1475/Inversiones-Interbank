"use client"

import { useParams } from "next/navigation"
import { 
  Building2, TrendingUp, ArrowLeft, User, Calendar, BarChart, 
  FileText, Share2
} from "lucide-react"
import { Button } from "@/components/ui/button" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import DialogComponent from "@/components/dialog"
import { useDialog } from "@/context/DialogContext"
import { useEffect, useState } from "react"

interface Proyecto {
  empresa: string;
  id: number;
  categoria: string;
  titulo: string;
  descripcion: string;
  descripcionExtendida: string;
  montoRequerido: number;
  montoRecaudado: number;
  porcentaje: number;
  fechaInicio: string;
  fechaFin: string;
  inversores: number;
}

interface Inversor {
  nombre_inversor: string;
  apellido_inversor: string;
  dias_desde_inversion: number;
}

export default function ProyectoDetallePage() {
  const params = useParams()
  const proyectoId = Number(params.id)
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [inversores, setInversores] = useState<Inversor[]>([]);
  const {setOpen} = useDialog();

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        const response = await fetch(`http://localhost:8000/project/${proyectoId}`)
        const data = await response.json()  // Convertir los datos a JSON
        setProyecto({
          empresa: data.empresa,
          id: data.id,
          categoria: data.categoria,
          titulo: data.titulo,
          descripcion: data.descripcion,
          descripcionExtendida: data.descripcion_extendida,
          montoRequerido: data.monto_requerido,
          montoRecaudado: data.monto_recaudado,
          porcentaje: data.porcentaje,
          fechaInicio: data.fecha_inicio,
          fechaFin: data.fecha_fin,
          inversores: data.inversores,
        })
      } catch (error) {
        console.error("Error al obtener los proyectos:", error)
      }
    }
    fetchProyecto()  // Ejecutamos la función para obtener los proyectos
  }, [proyectoId]);

  // Función para obtener los inversores recientes
  useEffect(() => {
    const fetchInversores = async () => {
      try {
        const response = await fetch(`http://localhost:8000/project/inversores/${proyectoId}`);
        const data = await response.json();
        setInversores(data);  // Guardamos los inversores en el estado
      } catch (error) {
        console.error("Error al obtener los inversores:", error);
      }
    };
    fetchInversores();
  }, [proyectoId]); 

  if (!proyecto) {
    return <div>Cargando...</div>; // Mostrar mientras se cargan los datos
  }

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      Tecnologia: "bg-blue-100 text-blue-800",
      Sostenibilidad: "bg-green-100 text-green-800",
      Logistica: "bg-purple-100 text-purple-800",
      Salud: "bg-red-100 text-red-800",
      Energia: "bg-yellow-100 text-yellow-800",
      Agricultura: "bg-orange-100 text-orange-800"
    }
    return colorMap[color] || "bg-gray-100 text-gray-800"
  }
  
  const getLogoColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      Tecnologia: "bg-blue-600",
      Sostenibilidad: "bg-green-600",
      Logistica: "bg-purple-600",
      Salud: "bg-red-600",
      Energia: "bg-yellow-600",
      Agricultura: "bg-orange-600"
    }
    return colorMap[color] || "bg-gray-600"
  }

  return (
    
    <div className={"min-h-screen bg-white transition-all duration-150"}>
      
      {/* Encabezado del proyecto */}
      <div className="bg-green-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/oportunidades" className="text-green-600 hover:text-green-700 inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a oportunidades
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className={`w-16 h-16 ${getLogoColorClass(proyecto.categoria)} rounded-2xl flex items-center justify-center shadow-md`}>
              <Building2 className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={getColorClass(proyecto.categoria)}>
                  {proyecto.categoria}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {proyecto.porcentaje}% financiado
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{proyecto.titulo}</h1>
              <p className="text-lg text-gray-600 mt-2">{proyecto.descripcion}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Sobre el proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {proyecto.descripcionExtendida}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interesados recientes</CardTitle>
                <CardDescription>
                  Últimas personas que invirtieron
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mostrar los inversores recientes */}
                {inversores.length > 0 ? (
                  inversores.map((inversor, index) => (
                    <div key={index} className="space-y-4 mb-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${getLogoColorClass(proyecto.categoria)} rounded-full flex items-center justify-center text-white font-semibold mr-3`}>
                          {inversor.nombre_inversor[0]}{inversor.apellido_inversor[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{inversor.nombre_inversor} {inversor.apellido_inversor}</div>
                          <div className="text-sm text-gray-600">{inversor.dias_desde_inversion} días</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No hay inversores recientes.</p>
                )}
              </CardContent>
            </Card>
            
          </div>
          
          {/* Sidebar de inversión */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de inversión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Objetivo:</span>
                    <span className="font-semibold">
                      ${proyecto.montoRequerido?.toLocaleString() ?? "No disponible"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recaudado:</span>
                    <span className="font-semibold text-green-600">
                      ${proyecto.montoRecaudado?.toLocaleString() ?? "No disponible"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Inversores:</span>
                    <span className="font-semibold">{proyecto.inversores}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${proyecto.porcentaje}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-center text-gray-600">
                    {proyecto.porcentaje}% completado
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Empresa:
                    </span>
                    <span className="font-medium">{proyecto.empresa}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha inicio:
                    </span>
                    <span className="font-medium">{proyecto.fechaInicio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha cierre:
                    </span>
                    <span className="font-medium">{proyecto.fechaFin}</span>
                  </div>
                </div>

                <Link href="auth/login">
                  <Button onClick={() => setOpen(true)} size="lg" className="w-full bg-green-600 cursor-pointer hover:bg-green-700 text-white mb-6">
                    Invertir ahora
                  </Button>
                </Link>
                
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" size="sm" className="text-gray-600">
                    <Share2 className="w-4 h-4 mr-1" />
                    Compartir
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600">
                    <FileText className="w-4 h-4 mr-1" />
                    Descargar info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
