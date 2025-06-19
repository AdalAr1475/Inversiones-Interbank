"use client";

import { useParams } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  TrendingUp,
  Calendar,
  BarChart,
  FileText,
  Share2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  MessageSquare,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import HeaderLat from "@/components/header-lat";
import { useSidebar } from "@/context/SidebarContext";
import DialogComponent from "@/components/dialog";
import { getDetailsProyecto } from "@/api/proyectos";
import { ProyectoType } from "@/types/proyecto";
import InvestmentDialog from "@/components/investment-dialog";
import ChatDialog from "@/components/chat-dialog";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { jwtDecode } from "jwt-decode";
import { redirect, useRouter, useSearchParams } from "next/navigation";

export default function ProyectoDetallePage() {
  const params = useParams();
  const proyectoId = Number(params.id);
  const [proyecto, setProyecto] = useState<ProyectoType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showInvestDialog, setShowInvestDialog] = useState<boolean>(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState<boolean>(false);

  //Routeador
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  interface DecodedToken {
    id: number;
    sub: string;
    tipo_usuario: string;
    exp: number;
  }

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        redirect("/auth/login");
      }
    } else {
      redirect("/auth/login");
    }

    const fetchProyectoDetails = async () => {
      try {
        setIsLoading(true);
        if (token) {
          const details = await getDetailsProyecto(proyectoId, token);
          setProyecto(details);
          console.log(details);
        }
      } catch (error) {
        console.error("Error al obtener los detalles del proyecto:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProyectoDetails();
  }, [proyectoId]);

  const getColorEstado = (categoria: string) => {
    const colorMap: Record<string, string> = {
      Activo: "bg-green-100 text-green-800",
      Cancelado: "bg-red-100 text-red-800",
      Completado: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[categoria] || "bg-gray-100 text-gray-800";
  };

  const getLogoColorClass = (sector: string) => {
    const colorMap: { [key: string]: string } = {
      Energía: "bg-yellow-600", // Amarillo para energía
      "Agricultura y agroindustria": "bg-orange-600", // Verde para agricultura
      "Tecnología y innovación": "bg-blue-600", // Azul para tecnología
      Salud: "bg-red-600", // Rojo para salud
      Turismo: "bg-teal-600", // Teal para turismo
      Finanzas: "bg-indigo-600", // Índigo para finanzas
      "Construcción e infraestructura": "bg-orange-600", // Naranja para construcción
      "Sostenibilidad y medio ambiente": "bg-green-600", // Verde lima para sostenibilidad
      Educación: "bg-purple-600", // Morado para educación
    };
    return colorMap[sector] || "bg-gray-600"; // Color por defecto en gris
  };

  const getColorCategoria = (categoria: string) => {
    const colorMap: { [key: string]: string } = {
      Energía: "bg-yellow-100 text-yellow-800",
      "Agricultura y agroindustria": "bg-orange-100 text-orange-800",
      "Tecnología y innovación": "bg-blue-100 text-blue-800",
      Salud: "bg-red-100 text-red-800",
      Turismo: "bg-teal-100 text-teal-800",
      Finanzas: "bg-indigo-100 text-indigo-800",
      "Construcción e infraestructura": "bg-orange-100 text-orange-800",
      "Sostenibilidad y medio ambiente": "bg-green-100 text-green-800",
      Educación: "bg-purple-100 text-purple-800",
    };
    return colorMap[categoria];
  };

  const getLogoIcon = () => {
    return <TrendingUp className="w-8 h-8 text-white" />;
  };

  const { collapsed } = useSidebar();

  // Calculate percentage of funding completed
  const calculatePercentage = (
    recaudado: number,
    requerido: number
  ): number => {
    if (!requerido) return 0;
    const percentage = (recaudado / requerido) * 100;
    return Math.min(Math.round(percentage), 100);
  };

  // Format dates nicely
  const formatDate = (date: Date | null | string): string => {
    if (!date) return "No disponible";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  // Función para mostrar notificación después de invertir
  const handlePostInvestment = (amount: number) => {
    // Aquí se podría implementar una notificación o algún feedback visual
    console.log(`Inversión de $${amount} procesada correctamente`);
    // También se podría actualizar el estado del proyecto después de la inversión

    //Copiar contrato
    fetch(`http://localhost:8000/documents/copiar-contrato/${proyectoId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      })
      .catch((error) => {
        console.error("Error al copiar el contrato:", error);
      });

    fetch(
      `http://localhost:8000/invest/get-ultima-inversion-proyecto/${proyectoId}`
    )
      .then(async (res) => {
        if (res.status === 404) {
          return 0; // Si no se encuentra la inversión, retornar 0
        }
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        //Redireccionar al inversor a la página de documentos de la inversión para firmar
        router.push(
          `/dashboard/inversor?inversion_id=${data.inversion_id}&tab=contratos`
        );
      })
      .catch((error) => {
        console.error("Error al cargar la última inversion:", error);
      });
  };

  if (isLoading) {
    return (
      <div
        className={
          "min-h-screen bg-white transition-all duration-150 flex items-center justify-center" +
          (collapsed ? " ml-16" : " ml-56")
        }
      >
        <HeaderLat />
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
          <h2 className="mt-4 text-lg font-medium">
            Cargando detalles del proyecto...
          </h2>
        </div>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div
        className={
          "min-h-screen bg-white transition-all duration-150" +
          (collapsed ? " ml-16" : " ml-56")
        }
      >
        <HeaderLat />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6">
            <Link
              href="/oportunidades"
              className="text-green-600 hover:text-green-700 inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a oportunidades
            </Link>
          </div>
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Proyecto no encontrado</h2>
            <p className="mb-6">
              No se pudo cargar la información de este proyecto.
            </p>
            <Button asChild>
              <Link href="/oportunidades">Ver todas las oportunidades</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate funding percentage
  const fundingPercentage = calculatePercentage(
    proyecto.monto_recaudado,
    proyecto.monto_requerido
  );

  return (
    <div
      className={
        "min-h-screen bg-white transition-all duration-150" +
        (collapsed ? " ml-16" : " ml-56")
      }
    >
      <HeaderLat />
      <DialogComponent />
      {/* Encabezado del proyecto */}
      <div className="bg-green-50 py-6 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 md:mb-6">
            <Link
              href="/oportunidades"
              className="text-green-600 hover:text-green-700 inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a oportunidades
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div
              className={`w-14 h-14 md:w-16 md:h-16 ${getLogoColorClass(
                proyecto.categoria
              )} rounded-2xl flex items-center justify-center shadow-md`}
            >
              {getLogoIcon()}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={getColorEstado(proyecto.estado)}>
                  {proyecto.estado || "Activo"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  {proyecto.porcentaje}% financiado
                </Badge>
                <Badge
                  variant="outline"
                  className={getColorCategoria(proyecto.categoria)}
                >
                  {proyecto.categoria || "Tecnología"}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {proyecto.titulo}
              </h1>
              <p className="text-base md:text-lg text-gray-600 mt-2">
                {proyecto.descripcion}
              </p>
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <Building2 className="w-4 h-4 mr-1" />
                <span>
                  Presentado por:{" "}
                  <span className="font-medium">{proyecto.emprendedor}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="descripcion" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                <TabsTrigger value="detalles">Detalles</TabsTrigger>
                <TabsTrigger value="actualizaciones">
                  Actualizaciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="descripcion" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre el proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-justify">
                      {proyecto.descripcion_extendida}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>¿Por qué invertir?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                          <span>
                            Mercado en crecimiento con potencial de expansión
                            global.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                          <span>
                            Equipo experimentado con trayectoria comprobada en
                            el sector.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                          <span>
                            Modelo de negocio validado con clientes activos y
                            recurrentes.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                          <span>
                            Tecnología innovadora con ventajas competitivas
                            claras.
                          </span>
                        </li>
                      </>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Riesgos a considerar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <>
                        <li className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                          <span>
                            Posible entrada de grandes competidores en el
                            mercado.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                          <span>
                            Cambios regulatorios que podrían afectar la
                            operación.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                          <span>
                            Dependencia de proveedores clave para algunos
                            componentes.
                          </span>
                        </li>
                      </>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="detalles" className="space-y-6">
                {" "}
                <Card>
                  <CardHeader>
                    <CardTitle>Información financiera</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">
                          Métricas clave
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Monto requerido:
                            </span>
                            <span className="font-medium">
                              $
                              {proyecto.monto_requerido?.toLocaleString() ||
                                "0"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Monto recaudado:
                            </span>
                            <span className="font-medium">
                              $
                              {proyecto.monto_recaudado?.toLocaleString() ||
                                "0"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Porcentaje completado:
                            </span>
                            <span className="font-medium">
                              {proyecto.porcentaje || fundingPercentage}%
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Número de inversores:
                            </span>
                            <span className="font-medium">
                              {proyecto.inversores || 0}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">
                          Información general
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Fecha inicio:</span>
                            <span className="font-medium">
                              {proyecto.fecha_inicio}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Fecha fin:</span>
                            <span className="font-medium">
                              {proyecto.fecha_fin}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Estado:</span>
                            <span className="font-medium">
                              {proyecto.estado || "Activo"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Categoría:</span>
                            <span className="font-medium">
                              {proyecto.categoria || "General"}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-900 mb-4">
                          Detalles técnicos
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              ID del proyecto:
                            </span>
                            <span className="font-medium">{proyecto.id}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              ID de emprendedor:
                            </span>
                            <span className="font-medium">
                              {proyecto.emprendedor_id || "N/A"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre el emprendedor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">
                          Información básica
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                              <span className="text-gray-600 block">
                                ID del Emprendedor:
                              </span>
                              <span className="font-medium">
                                {proyecto.emprendedor_id}
                              </span>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                              <span className="text-gray-600 block">
                                Inicio de proyecto:
                              </span>
                              <span className="font-medium">
                                {proyecto.fecha_inicio}
                              </span>
                            </div>
                          </li>
                        </ul>
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
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                        >
                          <FileText className="w-5 h-5 mr-2 text-gray-500" />
                          <span>Plan de negocio.pdf</span>
                        </Button>
                      </li>
                      <li>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                        >
                          <BarChart className="w-5 h-5 mr-2 text-gray-500" />
                          <span>Proyecciones financieras.xlsx</span>
                        </Button>
                      </li>
                      <li>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                        >
                          <Share2 className="w-5 h-5 mr-2 text-gray-500" />
                          <span>Presentación del proyecto.pptx</span>
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
                    {/* Si hay actualizaciones en el proyecto, las mostramos, sino usamos datos genéricos */}
                    <div className="space-y-6">
                      <div className="border-l-2 border-green-500 pl-4">
                        <p className="text-xs text-gray-500 mb-1">
                          {proyecto.fecha_inicio}
                        </p>
                        <h3 className="font-medium mb-2">
                          Lanzamiento oficial del proyecto
                        </h3>
                        <p className="text-gray-700">
                          Hemos iniciado oficialmente la campaña de inversión.
                          Los primeros resultados son prometedores y estamos
                          recibiendo mucho interés de potenciales inversores.
                        </p>
                      </div>

                      <div className="border-l-2 border-green-500 pl-4">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(
                            new Date(proyecto.fecha_inicio).getTime() -
                              10 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </p>
                        <h3 className="font-medium mb-2">
                          Preparativos para el lanzamiento
                        </h3>
                        <p className="text-gray-700">
                          Estamos ultimando los detalles para el lanzamiento
                          oficial. El equipo está trabajando arduamente para
                          asegurar que todo esté listo para recibir a los
                          primeros inversores.
                        </p>
                      </div>

                      <div className="border-l-2 border-green-500 pl-4">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(
                            new Date(proyecto.fecha_inicio).getTime() -
                              20 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </p>
                        <h3 className="font-medium mb-2">
                          Validación del modelo de negocio
                        </h3>
                        <p className="text-gray-700">
                          Hemos completado la fase de validación con clientes
                          potenciales y los resultados son muy positivos. Esto
                          nos da confianza en el potencial de crecimiento del
                          proyecto.
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
                    <span className="font-semibold">
                      ${proyecto.monto_requerido?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recaudado:</span>
                    <span className="font-semibold text-green-600">
                      ${proyecto.monto_recaudado?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-semibold">{proyecto.estado}</span>
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
                      <User className="w-4 h-4 mr-2" />
                      Emprendedor:
                    </span>
                    <span className="font-medium">{proyecto.emprendedor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha inicio:
                    </span>
                    <span className="font-medium">{proyecto.fecha_inicio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Fecha cierre:
                    </span>
                    <span className="font-medium">{proyecto.fecha_fin}</span>
                  </div>{" "}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Estado:
                    </span>
                    <span className="font-medium">
                      {proyecto.estado || "Activo"}
                    </span>
                  </div>
                  {(!proyecto.estado ||
                    proyecto.estado.toLowerCase() === "activo") && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Inversión mínima:</span>
                      <span className="font-medium text-green-600">
                        $100.00
                      </span>
                    </div>
                  )}
                </div>{" "}
                <Button
                  onClick={() => setShowInvestDialog(true)}
                  size="lg"
                  className="w-full bg-green-600 cursor-pointer hover:bg-green-700 hover:scale-[1.02] transition-all duration-200 text-white font-medium py-3 text-base shadow-md"
                  disabled={
                    proyecto.estado
                      ? proyecto.estado.toLowerCase() !== "activo"
                      : false
                  }
                >
                  {!proyecto.estado ||
                  proyecto.estado.toLowerCase() === "activo" ? (
                    <>
                      <span className="mr-2">Invertir ahora</span>
                      {fundingPercentage < 100 && (
                        <span className="text-xs bg-white text-green-700 px-2 py-1 rounded-full">
                          ¡{100 - fundingPercentage}% pendiente!
                        </span>
                      )}
                    </>
                  ) : (
                    "Proyecto no disponible"
                  )}
                </Button>{" "}
                {/* Botón para chatear con la empresa */}
                <Button
                  onClick={() => setShowQuestionDialog(true)}
                  size="lg"
                  variant="outline"
                  className="w-full mt-2 border-green-600 text-green-600 hover:bg-green-50 cursor-pointer transition-all duration-200 font-medium py-3 text-base"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chatear con {proyecto.emprendedor}
                </Button>
                {/* Investment Dialog */}
                {proyecto && (
                  <InvestmentDialog
                    open={showInvestDialog}
                    onOpenChange={setShowInvestDialog}
                    project={proyecto}
                    onSuccess={handlePostInvestment}
                  />
                )}
                {/* Chat Dialog */}
                {proyecto && (
                  <ChatDialog
                    open={showQuestionDialog}
                    onOpenChange={setShowQuestionDialog}
                    project={proyecto}
                  />
                )}
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
                <CardTitle>Proyectos similares</CardTitle>
                <CardDescription>Puede interesarte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 text-gray-500">
                  <p>No hay proyectos similares disponibles en este momento.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
