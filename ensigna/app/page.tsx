"use client"
import {
  ArrowRight,
  Building2,
  Users,
  DollarSign,
  Target,
  CheckCircle,
  PieChart,
} from "lucide-react"
import Header from "@/components/header";
import CardInvest from "@/components/card-invest";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { jwtDecode } from "jwt-decode";
// Importamos useEffect para el efecto de scrolling suave

export default function EnsignaLanding() {
  const [proyectos, setProyectos] = useState<any[]>([])
  const [proyectosDestacados, setProyectosDestacados] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isLogeado, setIsLogeado] = useState<boolean>(false)
  const [tipoUsuario, setTipoUsuario] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  interface DecodedToken {
      id: number
      email: string
      tipo_usuario: string
      exp: number
  }

  useEffect(() => {

    if (token) {
      setIsLogeado(true)
      const decodedToken = jwtDecode<DecodedToken>(token);
      setTipoUsuario(decodedToken.tipo_usuario)
    }
    
    // Función para manejar el desplazamiento suave
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement

      // Verificar si el elemento es un enlace interno con ancla (#)
      if (target.tagName === "A" && target.getAttribute("href")?.startsWith("#")) {
        e.preventDefault()
        const id = target.getAttribute("href")?.substring(1)
        const element = document.getElementById(id as string)

        if (element) {
          // Realizar desplazamiento suave
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }
    }

    // Agregar evento a todos los enlaces
    document.addEventListener("click", handleSmoothScroll)

    const fetchProyectos = async () => {
      try {
        const response = await fetch("http://localhost:8000/project/get-proyectos?limit=3")
        const data = await response.json()
        setProyectos(data)
        setProyectosDestacados(data.sort((a: any, b: any) => b.recaudado/b.meta - a.recaudado/a.meta).slice(0, 3))
        setLoading(false)
      } catch (error) {
        console.error("Error al obtener los proyectos:", error)
        setLoading(false)
      }
    }
    fetchProyectos()

    // Limpiar el evento cuando el componente se desmonte
    return () => {
      document.removeEventListener("click", handleSmoothScroll)
    }
  
  }, [])

  const handleClickOportunidades = () => {
    if (isLogeado) {
      redirect("/oportunidades"); // Redirige a oportunidades si está logeado
    } else {
      redirect("/auth/login"); // Redirige al login si no está logeado
    }
  };

  const handleClickVerificar = () => {
    if(isLogeado) {
      if(tipoUsuario === "inversor") {
        redirect("/dashboard/inversor")
      }
      else {
        redirect("/dashboard/emprendedor")
      }
    }
    else {
      redirect("/auth/login")
    }
  }

 const getLogoColorClass = (sector: string) => {
    const colorMap: { [key: string]: string } = {
      'Energía': 'bg-yellow-600',   
      'Agricultura y Agroindustria': 'bg-orange-600',
      'Tecnología y Innovación': 'bg-blue-600',  // Azul para tecnología
      'Salud': 'bg-red-600',                 // Rojo para salud
      'Turismo': 'bg-teal-600',              // Teal para turismo
      'Finanzas': 'bg-indigo-600',           // Índigo para finanzas
      'Construcción e Infraestructura': 'bg-orange-600', // Naranja para construcción
      'Sostenibilidad y Medio Ambiente': 'bg-green-600',
      'Educación': 'bg-purple-600',          // Morado para educación
    }
    return colorMap[sector] || 'bg-gray-600'; // Color por defecto en gris
  }

  return (
    <div className="min-h-screen bg-white">
      <Header/>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-white py-20 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  🤝 Conectamos Emprendedores e Inversores
                </Badge>
                <h1 className="text-4xl font-primary lg:text-6xl font-bold text-gray-900 leading-tight">
                  La plataforma que
                  <span className="text-green-600"> conecta</span> oportunidades
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Ensigna facilita la inversión entre emprendedores y inversores
                  individuales. Encuentra financiamiento o descubre las mejores oportunidades de
                  inversión.
                </p>
              </div>

              <Tabs defaultValue="inversor" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inversor">Soy Inversor</TabsTrigger>
                  <TabsTrigger value="empresa">Busco Inversión</TabsTrigger>
                </TabsList>
                <TabsContent value="inversor" className="space-y-4">
                  <p className="text-gray-600">
                    Descubre emprendimientos prometedores y diversifica tu portafolio
                  </p>
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleClickOportunidades}
                  >
                    Explorar Oportunidades
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </TabsContent>
                <TabsContent value="empresa" className="space-y-4">
                  <p className="text-gray-600">Presenta tu emprendimiento a inversores calificados</p>
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleClickVerificar}
                  >
                    Publicar Oportunidad
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-sm text-gray-600">Emprendedores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">2K+</div>
                  <div className="text-sm text-gray-600">Inversores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$25M+</div>
                  <div className="text-sm text-gray-600">Financiado</div>
                </div>
              </div>
            </div>

            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Oportunidades Destacadas</h3>
                    <Badge className="bg-green-100 text-green-800">Activas</Badge>
                  </div>
                  <div className="space-y-4">

                    <div className="space-y-4">
                      {loading ? (
                        <div>Cargando proyectos...</div>
                      ) : (
                        proyectosDestacados.map((proyecto) => (
                          <div key={proyecto.id} className="flex items-center justify-between p-3 cursor-pointer hover:bg-green-100 duration-150 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 ${getLogoColorClass(proyecto.categoria)} rounded-full flex items-center justify-center`}>
                                <Building2 className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{proyecto.titulo}</div>
                                <div className="text-sm text-gray-600">Busca ${proyecto.meta.toLocaleString()} • {proyecto.categoria}</div>
                                <div className="text-sm text-green-600 font-medium">Retorno estimado: {proyecto.rentabilidad}</div>
                              </div>
                            </div>
                            <div className="text-green-600 font-semibold">{Math.floor((proyecto.recaudado / proyecto.meta) * 100)}% financiado</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Cómo Funciona Ensigna</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conectamos emprendedores que buscan financiamiento con inversores que buscan oportunidades
            </p>
          </div>

          <Tabs defaultValue="empresas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12">
              <TabsTrigger value="empresas">Para Emprendedores</TabsTrigger>
              <TabsTrigger value="inversores">Para Inversores</TabsTrigger>
            </TabsList>

            <TabsContent value="empresas">
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-green-100 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800">1. Registra tu Emprendimiento</CardTitle>
                    <CardDescription>Crea tu perfil y presenta tu idea de negocio</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-green-100 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800">2. Define tu Objetivo</CardTitle>
                    <CardDescription>Establece cuánto necesitas y para qué lo usarás</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-green-100 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800">3. Conecta con Inversores</CardTitle>
                    <CardDescription>Recibe inversiones de empresas e individuos interesados</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inversores">
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-green-100 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PieChart className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800">1. Explora Oportunidades</CardTitle>
                    <CardDescription>
                      Descubre empresas que buscan inversión en diferentes sectores
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-green-100 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800">2. Analiza y Decide</CardTitle>
                    <CardDescription>Revisa documentos, métricas y planes de negocio</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-green-100 text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800">3. Invierte y Monitorea</CardTitle>
                    <CardDescription>
                      Realiza tu inversión y sigue el progreso desde tu dashboard
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Opportunities Preview */}
      <section id="oportunidades" className="py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Oportunidades de Inversión</h2>
            <p className="text-xl text-gray-600">Emprededores verificados buscando financiamiento</p>
          </div>

          {loading ? (
            <div>Cargando proyectos...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proyectos.map((proyecto) => (
                <CardInvest
                  key={proyecto.id}  // Usamos el título como clave para cada CardInvest
                  id = {proyecto.id}
                  category={proyecto.categoria}
                  title={proyecto.titulo}
                  description={proyecto.descripcion}
                  goal={proyecto.meta}
                  raised={proyecto.recaudado}
                  rentabilidad={proyecto.rentabilidad}
                  investors={proyecto.inversores}
                  logeado = {isLogeado}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-green-600 cursor-pointer text-green-600 hover:text-green-600 hover:shadow-md"
              onClick={handleClickOportunidades}
            >
              Ver Todas las Oportunidades
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Emprendedores Registrados</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">2,000+</div>
              <div className="text-gray-600">Inversores Activos</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">$25M+</div>
              <div className="text-gray-600">Total Financiado</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">89%</div>
              <div className="text-gray-600">Tasa de Éxito</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20 bg-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Historias de Éxito</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Badge className="bg-blue-100 text-blue-800">Emprendedor</Badge>
                </div>
                <p className="text-gray-600 mb-4">
                  &ldquo;Gracias a Ensigna conseguimos el financiamiento que necesitábamos para expandir nuestro
                  negocio. El proceso fue transparente y encontramos inversores que realmente creen en nuestro
                  proyecto.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    L
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Laura Mendoza</div>
                    <div className="text-sm text-gray-600">CEO, TechStart AI</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Badge className="bg-green-100 text-green-800">Inversor</Badge>
                </div>
                <p className="text-gray-600 mb-4">
                  &ldquo;Como inversor, Ensigna me ha permitido diversificar mi portafolio invirtiendo en startups y emprendimientos
                  prometedores. La plataforma es segura y me da toda la información que necesito para tomar
                  decisiones informadas.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    R
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Roberto Silva</div>
                    <div className="text-sm text-gray-600">Inversor Ángel</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              ¿Listo para conectar con oportunidades?
            </h2>
            <p className="text-xl text-green-100">
              Únete a la comunidad de emprededores e inversores que están construyendo el futuro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-600 border cursor-pointer border-white  hover:bg-transparent hover:text-white"
                onClick={handleClickVerificar}
              >
                Soy Inversor
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white cursor-pointer text-white bg-transparent hover:bg-white hover:text-green-600"
                onClick={handleClickVerificar}
              >
                Busco Inversión
              </Button>
            </div>
            <p className="text-sm text-green-200">
              Proceso 100% digital • Verificación completa • Soporte especializado
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">Ensigna</span>
              </div>
              <p className="text-gray-400">
                Conectamos emprendedores que buscan financiamiento con inversores que buscan oportunidades.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Para Emprendedores</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Publicar Oportunidad
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Dashboard Empredendedor
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Recursos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Para Inversores</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Explorar Oportunidades
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Dashboard Inversor
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Análisis de Mercado
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Contacto
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Términos y Condiciones
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ensigna. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
