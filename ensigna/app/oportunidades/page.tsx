"use client"

import { useEffect, useState } from "react"
import { 
  Search, Filter, CheckCircle, ArrowUpDown, 
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input"
import { getAllProyectos, ProyectoResumen } from "@/api/proyectos"
import CardInvest from "@/components/card-invest"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { jwtDecode } from "jwt-decode"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import HeaderLat from "@/components/header-lat"
import { useSidebar } from "@/context/SidebarContext"

interface Proyecto {
  id: number;
  categoria: string;
  titulo: string;
  descripcion: string;
  meta: number;
  recaudado: number;
  rentabilidad: number;
  inversores: number;
}

export default function OportunidadesPage() {  // Estado para filtros
  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([])  // Lista de proyectos
  const [loading, setLoading] = useState<boolean>(true)  // Estado de carga

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  interface DecodedToken {
      id: number
      sub: string
      tipo_usuario: string
      exp: number
  }

  useEffect(() => {
    if (token) {
      // Si ya está logueado, redirigir al dashboard correspondiente
      const decodedToken = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token ha expirado
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        redirect("/auth/login")  // Redirigir a login si el token ha expirado
      }
    }
    else {
      // Si no hay token, redirigir al login
      redirect("/auth/login")
    }
  });

  useEffect(() => {
    const fetchProyectos = async () => {
      setLoading(true);
      try {
        const data = await getAllProyectos();  // Usamos la función de la API
        setProyectos(data);  // Guardamos los datos en el estado
        setLoading(false);  // Establecemos que la carga ha terminado
      } catch (error) {
        console.error("Error al obtener los proyectos:", error);
        setLoading(false);
      }
    }

    fetchProyectos();  // Ejecutamos la función para obtener los proyectos
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [selectedSorting, setSelectedSorting] = useState("newest")
  const [fundingRange, setFundingRange] = useState([0, 100])
  const [onlyActive, setOnlyActive] = useState(true)
  
  // Filtrar proyectos según los criterios
  const filteredProyectos = proyectos.filter(proyecto => {
    const porcentaje = Math.floor((proyecto.recaudado / proyecto.meta) * 100)
    const matchesSearch = proyecto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proyecto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "todas" || proyecto.categoria === selectedCategory
    const matchesFunding = porcentaje >= fundingRange[0] && porcentaje <= fundingRange[1]
    const matchesActive = !onlyActive || porcentaje < 100

    return matchesSearch && matchesCategory && matchesFunding && matchesActive
  })

  // Ordenar proyectos
  const sortedProyectos = [...filteredProyectos].sort((a, b) => {
    const porcentajeA = Math.floor((a.recaudado / a.meta) * 100);  // Calculamos el porcentaje de A
    const porcentajeB = Math.floor((b.recaudado / b.meta) * 100);  // Calculamos el porcentaje de B

    switch(selectedSorting) {
      case "highest-funded":
        return porcentajeB - porcentajeA;  // Ordenar de mayor a menor
      case "lowest-funded":
        return porcentajeA - porcentajeB;  // Ordenar de menor a mayor
      case "highest-goal":
        return b.meta - a.meta;  // Ordenar según la meta
      case "lowest-goal":
        return a.meta - b.meta;  // Ordenar según la meta
      default: // newest
        return b.id - a.id;  // Ordenar por ID (más reciente)
    }
  })

  const {collapsed} = useSidebar();
  
  return (
    <div className={"min-h-screen bg-white transition-all duration-150" + (collapsed ? " ml-16" : " ml-56")}>
      <HeaderLat />
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
                      <SelectItem value="Tecnología y Innovación">Tecnología y Innovación</SelectItem>
                      <SelectItem value="Sostenibilidad y Medio Ambiente">Sostenibilidad y Medio Ambiente</SelectItem>
                      <SelectItem value="Salud">Salud</SelectItem>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Agricultura y Agroindustria">Agricultura y Agroindustria</SelectItem>
                      <SelectItem value="Finanzas">Finanzas</SelectItem>
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
              {loading ? (
                <div>Cargando proyectos...</div>
              ) : sortedProyectos.length > 0 ? (
                <>
                  <div className="mb-5 flex justify-between items-center">
                    <p className="text-gray-600">{sortedProyectos.length} oportunidades encontradas</p>
                  </div>                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedProyectos.map(proyecto => (
                      <div key={proyecto.id}>
                        <Link href={`/oportunidades/${proyecto.id}`}>
                          <CardInvest
                            id={proyecto.id}
                            category={proyecto.categoria}
                            title={proyecto.titulo}
                            description={proyecto.descripcion}
                            goal={proyecto.meta}
                            raised={proyecto.recaudado}
                            rentabilidad={proyecto.rentabilidad}
                            investors={proyecto.inversores}
                            logeado={true}
                          />
                        </Link>
                      </div>
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
    </div>
  )
}
