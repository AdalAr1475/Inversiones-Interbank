"use client"

import { useState } from "react"
import { 
  Building2, Search, Filter, CheckCircle, ArrowUpDown, 
  TrendingUp, ChevronDown, ArrowLeft 
} from "lucide-react"
import { Button } from "@/components/ui/button" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

// Datos de ejemplo para las oportunidades de inversión
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
    logoColor: "blue"
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
    logoColor: "green"
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
    logoColor: "orange"
  },
  {
    id: 4,
    titulo: "HealthTech Connect",
    descripcion: "Plataforma de telemedicina y salud digital",
    categoria: "Salud",
    categoriaColor: "red",
    objetivo: 850000,
    recaudado: 467500,
    porcentaje: 55,
    inversores: 27,
    logo: "building2",
    logoColor: "red"
  },
  {
    id: 5,
    titulo: "EduLearn Pro",
    descripcion: "Software educativo para escuelas y universidades",
    categoria: "Educación",
    categoriaColor: "yellow",
    objetivo: 300000,
    recaudado: 270000,
    porcentaje: 90,
    inversores: 42,
    logo: "building2",
    logoColor: "yellow"
  },
  {
    id: 6,
    titulo: "AgriTech Solutions",
    descripcion: "Tecnología para agricultura sostenible",
    categoria: "Agricultura",
    categoriaColor: "green",
    objetivo: 450000,
    recaudado: 180000,
    porcentaje: 40,
    inversores: 15,
    logo: "building2",
    logoColor: "green"
  },
  {
    id: 7,
    titulo: "CyberShield",
    descripcion: "Sistema de ciberseguridad para pequeñas empresas",
    categoria: "Tecnología",
    categoriaColor: "blue",
    objetivo: 600000,
    recaudado: 360000,
    porcentaje: 60,
    inversores: 20,
    logo: "building2",
    logoColor: "blue"
  },
  {
    id: 8,
    titulo: "Urban Mobility",
    descripcion: "Soluciones de movilidad urbana sostenible",
    categoria: "Transporte",
    categoriaColor: "orange",
    objetivo: 1200000,
    recaudado: 540000,
    porcentaje: 45,
    inversores: 25,
    logo: "trendingUp",
    logoColor: "orange"
  },
  {
    id: 9,
    titulo: "FoodDelivery Plus",
    descripcion: "Plataforma logística para entrega de alimentos",
    categoria: "Logística",
    categoriaColor: "purple",
    objetivo: 400000,
    recaudado: 380000,
    porcentaje: 95,
    inversores: 38,
    logo: "building2",
    logoColor: "purple"
  },
]

// Componente para renderizar una tarjeta de proyecto
const ProyectoCard = ({ proyecto }) => {
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

  const getLogoIcon = (logo, color) => {
    if (logo === "trendingUp") {
      return <TrendingUp className="w-4 h-4 text-white" />
    }
    return <Building2 className="w-4 h-4 text-white" />
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

  return (
    <Card className="border-green-100 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className={getColorClass(proyecto.categoriaColor)}>
            {proyecto.categoria}
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {proyecto.porcentaje}% financiado
          </Badge>
        </div>
        <CardTitle className="text-green-800">{proyecto.titulo}</CardTitle>
        <CardDescription>{proyecto.descripcion}</CardDescription>
      </CardHeader>
      <CardContent>
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
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${proyecto.porcentaje}%` }}
            ></div>
          </div>
          <Link href={`/oportunidades/${proyecto.id}`}>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Ver Detalles
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OportunidadesPage() {  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [selectedSorting, setSelectedSorting] = useState("newest")
  const [fundingRange, setFundingRange] = useState([0, 100])
  const [onlyActive, setOnlyActive] = useState(true)
  
  // Filtrar proyectos según los criterios
  const filteredProyectos = proyectosData.filter(proyecto => {
    // Filtro por término de búsqueda
    const matchesSearch = proyecto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         proyecto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      // Filtro por categoría
    const matchesCategory = selectedCategory === "todas" || proyecto.categoria === selectedCategory
    
    // Filtro por porcentaje de financiación
    const matchesFunding = proyecto.porcentaje >= fundingRange[0] && proyecto.porcentaje <= fundingRange[1]
    
    // Filtro por proyectos activos (menos del 100% financiados)
    const matchesActive = !onlyActive || proyecto.porcentaje < 100
    
    return matchesSearch && matchesCategory && matchesFunding && matchesActive
  })
  
  // Ordenar proyectos
  const sortedProyectos = [...filteredProyectos].sort((a, b) => {
    switch(selectedSorting) {
      case "highest-funded":
        return b.porcentaje - a.porcentaje
      case "lowest-funded":
        return a.porcentaje - b.porcentaje
      case "highest-goal":
        return b.objetivo - a.objetivo
      case "lowest-goal":
        return a.objetivo - b.objetivo
      default: // newest
        return b.id - a.id
    }
  })
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header con navegación y título */}
      <div className="bg-green-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/" className="text-green-600 hover:text-green-700 inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Oportunidades de Inversión</h1>
          <p className="text-lg text-gray-600">Explora todas las empresas buscando financiamiento en nuestra plataforma</p>
        </div>
      </div>

      {/* Sección de filtros y resultados */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          {/* Búsqueda */}
          <div className="w-full md:w-2/3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Dropdown de ordenación */}
          <div className="w-full md:w-1/3">
            <Select value={selectedSorting} onValueChange={setSelectedSorting}>
              <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Ordenar por" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="highest-funded">Mayor financiamiento</SelectItem>
                <SelectItem value="lowest-funded">Menor financiamiento</SelectItem>
                <SelectItem value="highest-goal">Mayor objetivo</SelectItem>
                <SelectItem value="lowest-goal">Menor objetivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Contenedor principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros laterales */}
          <div className="order-2 lg:order-1 lg:col-span-1">
            <div className="bg-white p-5 rounded-lg border border-green-100 sticky top-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Filtros</h2>
                <Filter className="h-5 w-5 text-gray-500" />
              </div>
              
              {/* Filtro por categoría */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Categoría</h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Todas las categorías" />                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las categorías</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Sostenibilidad">Sostenibilidad</SelectItem>
                    <SelectItem value="Fintech">Fintech</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Educación">Educación</SelectItem>
                    <SelectItem value="Agricultura">Agricultura</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Logística">Logística</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por porcentaje de financiación */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">% Financiación</h3>
                <div className="px-2">
                  <Slider
                    value={fundingRange}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={setFundingRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{fundingRange[0]}%</span>
                    <span>{fundingRange[1]}%</span>
                  </div>
                </div>
              </div>
              
              {/* Filtro proyectos activos */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">                  <Checkbox 
                    id="active" 
                    checked={onlyActive} 
                    onCheckedChange={(checked) => setOnlyActive(!!checked)}
                    className="border-green-300 data-[state=checked]:bg-green-600"
                  />
                  <label 
                    htmlFor="active" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Solo proyectos activos
                  </label>
                </div>
              </div>
                <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("todas")
                  setSelectedSorting("newest")
                  setFundingRange([0, 100])
                  setOnlyActive(true)
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
          
          {/* Grid de proyectos */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            {sortedProyectos.length > 0 ? (
              <>
                <div className="mb-5 flex justify-between items-center">
                  <p className="text-gray-600">{sortedProyectos.length} oportunidades encontradas</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedProyectos.map(proyecto => (
                    <ProyectoCard key={proyecto.id} proyecto={proyecto} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron oportunidades</h3>
                <p className="text-gray-600 mb-4">Prueba con otros filtros o realiza una búsqueda diferente</p>                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("todas")
                    setSelectedSorting("newest")
                    setFundingRange([0, 100])
                    setOnlyActive(true)
                  }}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
