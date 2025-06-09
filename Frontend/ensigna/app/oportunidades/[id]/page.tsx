"use client"

import { useParams } from "next/navigation"
import { 
  Building2, TrendingUp, ArrowLeft, User, Calendar, BarChart, 
  FileText, Share2, DollarSign, CheckCircle, AlertTriangle 
} from "lucide-react"
import { Button } from "@/components/ui/button" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

// Datos de ejemplo para las oportunidades de inversión (igual que en page.tsx)
const proyectosData = [
  {
    id: 1,
    titulo: "TechStart AI",
    descripcion: "Plataforma de IA para automatización empresarial",
    categoria: "Tecnología",
    categoriaColor: "blue",
    objetivo: 500000,
    recaudado: 425000,
    porcentaje: 85,
    inversores: 23,
    logo: "building2",
    logoColor: "blue",
    inicio: "15 Mar 2025",
    fin: "15 Jul 2025",
    descripcionExtendida: "TechStart AI está revolucionando la forma en que las empresas automatizan sus procesos con nuestra plataforma de inteligencia artificial. Nuestra tecnología utiliza algoritmos avanzados de aprendizaje automático para optimizar flujos de trabajo, reducir costos operativos y aumentar la productividad. Con clientes en más de 10 países, estamos expandiendo nuestras operaciones para satisfacer la creciente demanda global.",
    riesgos: "Medio",
    retornoEstimado: "18% anual",
    ubicacion: "Lima, Perú",
    fundadores: "Laura Silva y Carlos Méndez",
    fechaFundacion: "2022",
    equipo: 12,
    sectores: ["Inteligencia Artificial", "SaaS", "Automatización"],
    minInversion: 5000
  },
  {
    id: 2,
    titulo: "EcoSolutions",
    descripcion: "Soluciones de energía renovable para empresas",
    categoria: "Sostenibilidad",
    categoriaColor: "green",
    objetivo: 1000000,
    recaudado: 620000,
    porcentaje: 62,
    inversores: 31,
    logo: "building2",
    logoColor: "green",
    inicio: "20 Feb 2025",
    fin: "20 Jun 2025",
    descripcionExtendida: "EcoSolutions desarrolla e implementa soluciones de energía renovable personalizadas para empresas que buscan reducir su huella de carbono y costos energéticos. Nuestros sistemas de paneles solares y turbinas eólicas de pequeña escala se integran perfectamente en las infraestructuras existentes, proporcionando energía limpia y sostenible. Con este financiamiento, ampliaremos nuestra capacidad de producción y entraremos en nuevos mercados latinoamericanos.",
    riesgos: "Bajo",
    retornoEstimado: "15% anual",
    ubicacion: "Santiago, Chile",
    fundadores: "María González y Pedro Fuentes",
    fechaFundacion: "2020",
    equipo: 18,
    sectores: ["Energía Renovable", "Sostenibilidad", "Cleantech"],
    minInversion: 10000
  },
  {
    id: 3,
    titulo: "FinanceFlow",
    descripcion: "Gestión financiera para pequeñas empresas",
    categoria: "Fintech",
    categoriaColor: "purple",
    objetivo: 750000,
    recaudado: 322500,
    porcentaje: 43,
    inversores: 18,
    logo: "trendingUp",
    logoColor: "orange",
    inicio: "10 Abr 2025",
    fin: "10 Ago 2025",
    descripcionExtendida: "FinanceFlow simplifica la gestión financiera para pequeñas empresas con una plataforma intuitiva que integra contabilidad, facturación, nómina y previsiones financieras. Nuestra solución basada en la nube elimina la complejidad y reduce drásticamente el tiempo dedicado a tareas administrativas. Con más de 1,000 clientes activos, buscamos expandir nuestras capacidades y ofrecer nuevos servicios financieros integrados.",
    riesgos: "Medio-Bajo",
    retornoEstimado: "16% anual",
    ubicacion: "Bogotá, Colombia",
    fundadores: "Juan Martínez",
    fechaFundacion: "2021",
    equipo: 15,
    sectores: ["Fintech", "SaaS", "Gestión Financiera"],
    minInversion: 7500
  }
]

export default function ProyectoDetallePage() {
  const params = useParams()
  const proyectoId = Number(params.id)
  
  // Encontrar el proyecto correspondiente
  const proyecto = proyectosData.find(p => p.id === proyectoId) || proyectosData[0]
  
  const getColorClass = (color) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
      red: "bg-red-100 text-red-800",
      yellow: "bg-yellow-100 text-yellow-800",
      orange: "bg-orange-100 text-orange-800"
    }
    return colorMap[color] || "bg-gray-100 text-gray-800"
  }
  
  const getLogoColorClass = (color) => {
    const colorMap = {
      blue: "bg-blue-600",
      green: "bg-green-600",
      purple: "bg-purple-600",
      red: "bg-red-600",
      yellow: "bg-yellow-600",
      orange: "bg-orange-600"
    }
    return colorMap[color] || "bg-gray-600"
  }
  
  const getLogoIcon = () => {
    if (proyecto.logo === "trendingUp") {
      return <TrendingUp className="w-8 h-8 text-white" />
    }
    return <Building2 className="w-8 h-8 text-white" />
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-green-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/oportunidades" className="text-green-600 hover:text-green-700 inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a oportunidades
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className={`w-16 h-16 ${getLogoColorClass(proyecto.logoColor)} rounded-2xl flex items-center justify-center shadow-md`}>
              {getLogoIcon()}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={getColorClass(proyecto.categoriaColor)}>
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
            <Tabs defaultValue="descripcion" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                <TabsTrigger value="detalles">Detalles</TabsTrigger>
                <TabsTrigger value="actualizaciones">Actualizaciones</TabsTrigger>
              </TabsList>
              
              <TabsContent value="descripcion" className="space-y-6">
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
                    <CardTitle>¿Por qué invertir?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <span>Mercado en crecimiento con potencial de expansión global.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <span>Equipo experimentado con trayectoria comprobada en el sector.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <span>Modelo de negocio validado con clientes activos y recurrentes.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <span>Tecnología innovadora con ventajas competitivas claras.</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Riesgos a considerar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                        <span>Posible entrada de grandes competidores en el mercado.</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                        <span>Cambios regulatorios que podrían afectar la operación.</span>
                      </li>
                      <li className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                        <span>Dependencia de proveedores clave para algunos componentes.</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="detalles" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información financiera</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">Métricas clave</h3>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Ingresos anuales:</span>
                            <span className="font-medium">$1,200,000</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Margen bruto:</span>
                            <span className="font-medium">68%</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">CAC:</span>
                            <span className="font-medium">$850</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">LTV:</span>
                            <span className="font-medium">$4,200</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">Proyecciones</h3>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Crecimiento anual:</span>
                            <span className="font-medium">35%</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Break-even:</span>
                            <span className="font-medium">Q4 2025</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">ROI estimado:</span>
                            <span className="font-medium">2.8x (5 años)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre la empresa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">Información básica</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                              <span className="text-gray-600 block">Fundadores:</span>
                              <span className="font-medium">{proyecto.fundadores}</span>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                              <span className="text-gray-600 block">Año de fundación:</span>
                              <span className="font-medium">{proyecto.fechaFundacion}</span>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                              <span className="text-gray-600 block">Ubicación:</span>
                              <span className="font-medium">{proyecto.ubicacion}</span>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                              <span className="text-gray-600 block">Equipo:</span>
                              <span className="font-medium">{proyecto.equipo} personas</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">Sectores</h3>
                        <div className="flex flex-wrap gap-2">
                          {proyecto.sectores.map((sector, index) => (
                            <Badge key={index} variant="outline" className="bg-green-50 border-green-200">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Documentación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <FileText className="w-5 h-5 mr-2 text-gray-500" />
                          <span>Plan de negocio.pdf</span>
                        </Button>
                      </li>
                      <li>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <BarChart className="w-5 h-5 mr-2 text-gray-500" />
                          <span>Proyecciones financieras.xlsx</span>
                        </Button>
                      </li>
                      <li>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <FileText className="w-5 h-5 mr-2 text-gray-500" />
                          <span>Presentación corporativa.pdf</span>
                        </Button>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="actualizaciones" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Actualizaciones recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-gray-900">Nuevo acuerdo de distribución</h3>
                          <span className="text-sm text-gray-500">2 Jun 2025</span>
                        </div>
                        <p className="text-gray-700">
                          Nos complace anunciar que hemos firmado un acuerdo de distribución con uno de los mayores proveedores de la industria, lo que nos permitirá reducir costos y mejorar nuestra cadena de suministro.
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-gray-900">Expansión a nuevos mercados</h3>
                          <span className="text-sm text-gray-500">15 May 2025</span>
                        </div>
                        <p className="text-gray-700">
                          Estamos iniciando operaciones en dos nuevos países este mes, lo que representa un importante paso en nuestra estrategia de internacionalización. Esperamos duplicar nuestra base de clientes en los próximos 6 meses.
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-gray-900">Nueva patente aprobada</h3>
                          <span className="text-sm text-gray-500">3 May 2025</span>
                        </div>
                        <p className="text-gray-700">
                          Nuestra solicitud de patente para la tecnología principal ha sido aprobada, lo que refuerza nuestra protección de propiedad intelectual y nos otorga una ventaja competitiva significativa en el mercado.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
                    <span className="font-semibold">${proyecto.objetivo.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recaudado:</span>
                    <span className="font-semibold text-green-600">${proyecto.recaudado.toLocaleString()}</span>
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
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha inicio:
                    </span>
                    <span className="font-medium">{proyecto.inicio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha cierre:
                    </span>
                    <span className="font-medium">{proyecto.fin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Nivel de riesgo:
                    </span>
                    <span className="font-medium">{proyecto.riesgos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Retorno estimado:
                    </span>
                    <span className="font-medium text-green-600">{proyecto.retornoEstimado}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Inversión mínima:
                    </span>
                    <span className="font-medium">${proyecto.minInversion}</span>
                  </div>
                </div>
                
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Invertir ahora
                </Button>
                
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
            
            <Card>
              <CardHeader>
                <CardTitle>Interesados recientes</CardTitle>
                <CardDescription>
                  Últimas personas que invirtieron
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      JL
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">José López</div>
                      <div className="text-sm text-gray-600">Hace 2 días</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      CM
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Carmen Martínez</div>
                      <div className="text-sm text-gray-600">Hace 3 días</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      RD
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Ricardo Díaz</div>
                      <div className="text-sm text-gray-600">Hace 5 días</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
