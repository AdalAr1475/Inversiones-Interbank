"use client";

import {
  ArrowUpRight,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderLat from "@/components/header-lat";
import ProtectedRoute from "@/components/ProtectedRoute";
import ListaConversaciones from "@/components/lista-conversaciones";
import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { jwtDecode } from "jwt-decode";
import { useSidebar } from "@/context/SidebarContext";
import { redirect, useRouter, useSearchParams } from "next/navigation";

interface DocumentoProyecto {
  id: number;
  nombre: string;
  descripcion: string;
  url: string;
  visibilidad: "público" | "privado";
  creadoEn: string;
  firmado: boolean;
  contenidoBase64?: string; // <--- ¡Asegúrate de que esta propiedad exista!
  tipo_documento: string;
}

interface Proyecto {
  id: number;
  nombre_proyecto: string;
  total_recaudado: number;
  objetivo: number;
  porcentaje: number;
  estado: string;
  descripcion: string;
  descripcion_extendida: string;
  tiempo_valor: number;
  tiempo_unidad: string;
  tiempo_valor_total: number;
  tiempo_unidad_total: string;
  inversores: number;
}

interface Inversor {
  nombre: string;
  apellido: string;
  monto_invertido: number;
  tiempo_desde_inversion: string;
}

export default function DashboardEmpresa() {
  const [emprendedorId, setEmprendedorId] = useState("");
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [proyectoNombre, setProyectoNombre] = useState<string>("");
  const [totalRecaudado, setTotalRecaudado] = useState<number | null>(null);
  const [objetivo, setObjetivo] = useState<number | null>(null);
  const [porcentaje, setPorcentaje] = useState<number | null>(null);
  const [estado, setEstado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [descripcionExtendida, setDescripcionExtendida] = useState("");
  const [tiempoValor, setTiempoValor] = useState<number | null>(null);
  const [tiempoUnidad, setTiempoUnidad] = useState("");
  const [tiempoValorTotal, setTiempoValorTotal] = useState<number | null>(null);
  const [tiempoUnidadTotal, setTiempoUnidadTotal] = useState("");
  const [inversores, setInversores] = useState<number | null>(null);
  const [inversoresProyecto, setInversoresProyecto] = useState<Inversor[]>([]);
  const [uploading, setUploading] = useState(false);

  const [documentos, setDocumentos] = useState<DocumentoProyecto[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");

  // --- Nuevos Hooks para manejar el estado de firma y verificación ---
  const [signingId, setSigningId] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  // --- Nuevo estado para el tipo de documento ---
  const [newDocumentType, setNewDocumentType] = useState<string>("Contrato"); // Valor por defecto
  const [newDocumentDescription, setNewDocumentDescription] = useState<string>(
    "Documento subido desde UI"
  ); // Para la descripción

  //Enrutador
  const [activeTab, setActiveTab] = useState("proyecto"); // Pestaña por defecto
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre_proyecto: "",
    descripcion: "",
    descripcion_extendida: "",
    sector: "",
    ubicacion: "",
    monto_pedido: 0.0,
    retorno_estimado: 0.0,
    fecha_fin: "",
  });
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  interface DecodedToken {
    id: number;
    email: string;
    tipo_usuario: string;
    exp: number;
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      setEmprendedorId(String(decodedToken.id));
    }
    else {
      redirect("/auth/login")
    }
  });

  console.log(emprendedorId)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search); // Usamos window.location.search para obtener los parámetros de la URL
    const success = urlParams.get("success");
    const userId = urlParams.get("user_id");

    if (success === "true" && userId) {
      // Llamar al backend para marcar la cuenta como activa
      const activateAccount = async () => {
        try {
          await axios.get(
            `http://127.0.0.1:8000/users/activate-account?user_id=${userId}&success=true`
          );
          alert("¡Tu cuenta ha sido activada exitosamente!");

          // Redirigir a la página de Dashboard de Emprendedor
          window.location.href = "/dashboard/emprendedor"; // Redirección manual en el cliente
        } catch (error) {
          console.error("Error al activar la cuenta:", error);
          alert(
            "Hubo un error al activar tu cuenta. Por favor, inténtalo de nuevo o contacta a soporte."
          );
        }
      };
      activateAccount();
    }
  }, []);

  useEffect(() => {
    if (emprendedorId) {
      fetch(`http://localhost:8000/project/emprendedor/${emprendedorId}`)
        .then((res) => {
          if (res.status === 404) {
            return [];
          }
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data: Proyecto[] | any) => {
          if (Array.isArray(data)) {
            setProyectos(data);
          } else {
            console.warn("La API no devolvió un array de proyectos:", data);
            setProyectos([]);
          }
        })
        .catch((error) => {
          console.error("Error al cargar proyectos:", error);
          setProyectos([]);
        });
    }
  }, [emprendedorId]);

  const fetchProyectos = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/project/emprendedor/${emprendedorId}`
      );
      if (!res.ok) {
        throw new Error(`Error al cargar proyectos: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProyectos(data);
      } else {
        setProyectos([]);
        console.warn("La API no devolvió un array de proyectos:", data);
      }
    } catch (error) {
      console.error(error);
      setProyectos([]);
    }
  };

  const proyectos_nombre = proyectos.map(
    (proyecto) => proyecto.nombre_proyecto
  );

  const handleProyectoChange = (nombreProyecto: string) => {
    setProyectoNombre(nombreProyecto);
    const proyecto = proyectos.find(
      (p) => p.nombre_proyecto === nombreProyecto
    );
    if (proyecto) {
      setProyectoId(proyecto.id);
      setTotalRecaudado(proyecto.total_recaudado);
      setObjetivo(proyecto.objetivo);
      setPorcentaje(proyecto.porcentaje);
      setEstado(proyecto.estado);
      setDescripcion(proyecto.descripcion);
      setDescripcionExtendida(proyecto.descripcion_extendida);
      setTiempoValor(proyecto.tiempo_valor);
      setTiempoUnidad(proyecto.tiempo_unidad);
      setTiempoValorTotal(proyecto.tiempo_valor_total);
      setTiempoUnidadTotal(proyecto.tiempo_unidad_total);
      setInversores(proyecto.inversores);
    } else {
      setProyectoId(null);
    }
  };

  useEffect(() => {
    if (proyectoId === null) {
      setInversoresProyecto([]); // Limpiar los inversores si no hay proyecto seleccionado
      return;
    }

    fetch(`http://localhost:8000/project/inversores/${proyectoId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setInversoresProyecto(data);
      })
      .catch((error) => {
        setInversoresProyecto([]); // Limpiar inversores en caso de error
      });
  }, [proyectoId]); // Se ejecuta cada vez que 'proyectoId' cambia

  const closeModal = () => {
    setIsModalOpen(false);
    // Limpiar los campos del formulario al cerrar el modal
    setNuevoProyecto({
      nombre_proyecto: "",
      descripcion: "",
      descripcion_extendida: "",
      sector: "Energía",
      ubicacion: "",
      monto_pedido: 0.0,
      retorno_estimado: 0.0,
      fecha_fin: "",
    });
    // Limpiar el mensaje y el estado de éxito/fallo
    setResponseMessage(null);
    setIsSuccess(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNuevoProyecto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación del retorno estimado
    if (nuevoProyecto.retorno_estimado >= 1) {
      setResponseMessage("El retorno debe ser menor a 1");
      setIsSuccess(false);
      return;
    }

    // Validación de la fecha de finalización
    const fechaFin = new Date(nuevoProyecto.fecha_fin);
    if (fechaFin < new Date()) {
      setResponseMessage("Ingrese una fecha de finalización válida");
      setIsSuccess(false);
      return;
    }

    const proyectoData = {
      emprendedor_id: emprendedorId,
      nombre_proyecto: nuevoProyecto.nombre_proyecto,
      descripcion: nuevoProyecto.descripcion,
      descripcion_extendida: nuevoProyecto.descripcion_extendida,
      monto_pedido: nuevoProyecto.monto_pedido,
      sector: nuevoProyecto.sector,
      retorno_estimado: nuevoProyecto.retorno_estimado,
      fecha_fin: nuevoProyecto.fecha_fin,
      ubicacion: nuevoProyecto.ubicacion,
    };

    console.log(proyectoData);

    try {
      const response = await fetch("http://localhost:8000/project/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proyectoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error desconocido");
      }
      const data = await response.json();

      setResponseMessage("Proyecto creado exitosamente");
      setIsSuccess(true);

      setTimeout(() => {
        closeModal();
        fetchProyectos();
      }, 2000);

      //Después de crear el proyecto, redirigir al usuario a la página del proyecto, pestaña documentos
      router.push(`/dashboard/emprendedor?project_id=${data.new_proyecto_id}&tab="documentos"`);

      // Opcional: mostrar un mensaje de éxito
      alert("¡Proyecto creado y redirigiendo a la pestaña de documentos!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setResponseMessage(errorMessage);
      setIsSuccess(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // abre el explorador de archivos
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = async () => {
      // split(",")[1] para obtener solo la parte Base64 (elimina "data:application/pdf;base64,")
      const base64Content = (reader.result as string).split(",")[1];

      try {
        await axios.post(
          "http://localhost:8000/documents/registrar-documento",
          {
            proyecto_id: proyectoId,
            nombre: file.name,
            descripcion: newDocumentDescription, // Usa el estado para la descripción
            contenido_base64: base64Content,
            tipo_documento: newDocumentType, // ¡Envía el tipo de documento!
            visibilidad: "privado", // o público según el caso
            usuario_id: emprendedorId, // Asumiendo que el emprendedor es el que sube el documento
          }
        );

        console.log(
          "Documento registrado con éxito para el proyecto ID:",
          proyectoId
        );

        // Actualiza lista de documentos después de la subida
        const res = await axios.get(
          `http://localhost:8000/documents/documentos/${proyectoId}`
        );
        console.log("Documentos recibidos y actualizados:", res.data);
        setDocumentos(res.data);
      } catch (error: any) {
        console.error("Error al registrar documento:", error);
        if (axios.isAxiosError(error) && error.response) {
          console.error(
            "Detalles del error del backend (subida):",
            error.response.data
          );
          alert(
            `Error al registrar documento: ${
              error.response.data.detail || "Error desconocido del servidor."
            }`
          );
        } else {
          alert("Ocurrió un error inesperado al registrar el documento.");
        }
      } finally {
        setFileName("");
        setUploading(false);
        setNewDocumentDescription("Documento subido desde UI"); // Reinicia la descripción
        setNewDocumentType("Contrato"); // Reinicia el tipo de documento
      }
    };

    reader.readAsDataURL(file);
  };

  // Función para verificar la firma de un documento
  const handleVerifyDocument = async (documentId: number) => {
    setVerifyingId(documentId); // Inicia el estado de carga
    try {
      // Para verificar, también necesitarías el contenido_base64 y el tipo_documento
      // Se asume que el endpoint de verify-document los manejará internamente
      // o que tu endpoint de verificación es más simple.
      // Si verify-document también espera contenido_base64 y tipo_documento,
      // deberías modificar esta función de manera similar a handleSignDocument.
      const response = await axios.post(
        "http://localhost:8000/documents/verify-document",
        {
          document_id: documentId,
          // Aquí podrías necesitar enviar contenido_base64 y tipo_documento si el backend lo requiere para verificar
        }
      );

      // Asumimos que el backend responde con una estructura como: { "success": boolean, "message": "..." }
      if (response.data.success) {
        alert(`Verificación exitosa: ${response.data.message}`);
      } else {
        alert(`Verificación fallida: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error al verificar la firma:", error);
      alert(
        "Error en la verificación. El documento podría haber sido alterado o la firma no es válida."
      );
    } finally {
      setVerifyingId(null); // Finaliza el estado de carga
    }
  };

  //Efecto para cambiar pestaña con searchParams
  useEffect(() => {
    // Obtenemos los parámetros de la URL.
    const projectIdFromUrl = searchParams.get("project_id");
    const tabFromUrl = searchParams.get("tab");
    console.log("Tab:" + tabFromUrl);

    // 1. Sincronizar el proyecto seleccionado.
    // Nos aseguramos de que tengamos un ID de proyecto en la URL y que la lista de proyectos ya se haya cargado.
    if (projectIdFromUrl && proyectos.length > 0) {
        const projectIdNum = parseInt(projectIdFromUrl, 10);
        
        // Buscamos el proyecto en la lista de proyectos cargados.
        const proyectoSeleccionado = proyectos.find(p => p.id === projectIdNum);
        
        // Si encontramos el proyecto y no está ya seleccionado, lo seleccionamos.
        if (proyectoSeleccionado && proyectoSeleccionado.id !== proyectoId) {
            // Usamos tu función existente para asegurar que todos los estados se actualicen correctamente.
            handleProyectoChange(proyectoSeleccionado.nombre_proyecto);
        }
    }

    // 2. Sincronizar la pestaña activa.
    if (tabFromUrl) {
      console.log("Tab desde URL:", tabFromUrl);
        setActiveTab(tabFromUrl);
    }
}, [searchParams, proyectos]); // Dependencias: se ejecuta si la URL o la lista de proyectos cambian.


  // --- EFECTO PARA CARGAR DOCUMENTOS CUANDO EL proyectoId CAMBIA ---
  useEffect(() => {
    if (proyectoId === null) {
      // No cargar documentos si no hay un proyecto seleccionado
      setDocumentos([]); // Limpiar documentos si no hay proyecto
      return;
    }

    console.log(`Cargando documentos para el proyecto ID: ${proyectoId}`);
    fetch(`http://localhost:8000/documents/documentos/${proyectoId}`) // Tu endpoint para filtrar por ID de proyecto
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: DocumentoProyecto[]) => {
        console.log("Documentos recibidos:", data);
        setDocumentos(data);
      })
      .catch((error) => {
        console.error("Error al cargar documentos:", error);
        setDocumentos([]); // En caso de error, limpiar los documentos
      });
  }, [proyectoId]); // Se ejecuta cada vez que 'proyectoId' cambia

  const { collapsed } = useSidebar();

  return (
    <ProtectedRoute requiredRole="emprendedor">
      <div
        className={
          "min-h-screen bg-white transition-all duration-150" +
          (collapsed ? " ml-16" : " ml-56")
        }
      >
        <HeaderLat />
        <div className="transition-all duration-300">
          {/* Main Content */}

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Emprendedor
              </h1>
              <p className="text-gray-600">
                Gestiona tu campaña de financiamiento y conecta con inversores
              </p>
            </div>

            <div className="mb-8 space-y-6">
              {/* Botón Crear Proyecto Mejorado */}
              <div className="bg-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold mb-2">
                      ¿Listo para tu próximo proyecto?
                    </h1>
                    <p className="text-green-100">
                      Crea una nueva campaña de financiamiento y comienza a
                      atraer inversores
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={openModal}
                    className="bg-white text-green-600 hover:bg-gray-100 font-bold px-10 py-7 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Nuevo Proyecto
                  </Button>
                </div>
              </div>

              {/* Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-green-600 bg-opacity-800 overflow-y-auto">
                  <div
                    className="bg-white p-6 rounded-xl relative
                                w-full sm:w-5/6 md:w-2/3 lg:w-1/2    
                                py-4 px-6 max-h-[85vh] overflow-y-auto"
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      Crear Nuevo Proyecto
                    </h2>
                    <form onSubmit={handleSubmit}>
                      {/* Nombre del proyecto */}
                      <div className="mb-4">
                        <Label htmlFor="nombre_proyecto" className="mb-2">
                          Nombre del Proyecto
                        </Label>
                        <Input
                          id="nombre_proyecto"
                          name="nombre_proyecto"
                          value={nuevoProyecto.nombre_proyecto}
                          onChange={handleInputChange}
                          required
                          className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      {/* Descripción breve */}
                      <div className="mb-4">
                        <Label htmlFor="descripcion" className="mb-2">
                          Descripción breve
                        </Label>
                        <Input
                          id="descripcion"
                          name="descripcion"
                          value={nuevoProyecto.descripcion}
                          onChange={handleInputChange}
                          required
                          className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      {/* Descripción completa */}
                      <div className="mb-4">
                        <Label htmlFor="descripcion_extendida" className="mb-2">
                          Descripción completa
                        </Label>
                        <textarea
                          id="descripcion_extendida"
                          name="descripcion_extendida"
                          value={nuevoProyecto.descripcion_extendida}
                          onChange={handleInputChange}
                          required
                          className="border border-green-200 focus:border-green-500 focus:ring-green-500 w-full h-32 p-2"
                        />
                      </div>

                      {/* Sector */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                          <Label htmlFor="sector" className="mb-2">
                            Sector
                          </Label>
                          <Select
                            value={nuevoProyecto.sector}
                            onValueChange={(value) =>
                              setNuevoProyecto((prev) => ({
                                ...prev,
                                sector: value,
                              }))
                            }
                          >
                            <SelectTrigger className="border border-green-200 focus:border-green-500 focus:ring-green-500 w-full rounded-md">
                              <SelectValue placeholder="Selecciona un sector" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "Energía",
                                "Agricultura y Agroindustria",
                                "Tecnología y Innovación",
                                "Salud",
                                "Turismo",
                                "Finanzas",
                                "Construcción e Infraestructura",
                                "Sostenibilidad y Medio Ambiente",
                                "Educación",
                              ].map((sector) => (
                                <SelectItem key={sector} value={sector}>
                                  {sector}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="mb-4">
                          <Label htmlFor="ubicacion" className="mb-2">
                            Ubicación
                          </Label>
                          <Input
                            id="ubicacion"
                            name="ubicacion"
                            value={nuevoProyecto.ubicacion}
                            onChange={handleInputChange}
                            required
                            className="border-green-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Monto pedido */}
                      <div className="mb-4">
                        <Label htmlFor="monto_pedido" className="mb-2">
                          Monto pedido
                        </Label>
                        <Input
                          id="monto_pedido"
                          name="monto_pedido"
                          type="number"
                          value={nuevoProyecto.monto_pedido}
                          onChange={handleInputChange}
                          required
                          className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      {/* Retorno estimado */}
                      <div className="mb-4">
                        <Label htmlFor="retorno_estimado" className="mb-2">
                          Retorno estimado (%)
                        </Label>
                        <Input
                          id="retorno_estimado"
                          name="retorno_estimado"
                          type="number"
                          value={nuevoProyecto.retorno_estimado}
                          onChange={handleInputChange}
                          required
                          className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      {/* Fecha fin */}
                      <div className="mb-4">
                        <Label htmlFor="fecha_fin" className="mb-2">
                          Fecha de fin
                        </Label>
                        <Input
                          id="fecha_fin"
                          name="fecha_fin"
                          type="date"
                          value={nuevoProyecto.fecha_fin}
                          onChange={handleInputChange}
                          required
                          className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      {responseMessage && (
                        <div
                          className={`mb-4 p-4 rounded-md text-white ${
                            isSuccess ? "bg-green-600" : "bg-red-600"
                          }`}
                        >
                          {responseMessage}
                        </div>
                      )}

                      <div className="flex justify-end space-x-4">
                        <Button
                          className="mb-2"
                          variant="outline"
                          onClick={closeModal}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">Crear Proyecto</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Selector de Proyectos */}
              <Card className="border-2 border-gray-200 bg-gray-50/50">
                <CardHeader>
                  <CardTitle className="text-green-800">
                    Mis Proyectos
                  </CardTitle>
                  <CardDescription>
                    Selecciona un proyecto existente para gestionar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Select
                      value={proyectoNombre}
                      onValueChange={handleProyectoChange}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500 w-full bg-white">
                        {/* Contenido del SelectTrigger */}
                        {proyectoNombre ? (
                          <div className="flex items-center space-x-3 w-full">
                            {" "}
                            {/* Usamos space-x-3 para el espaciado */}
                            <div
                              className={`w-2 h-2 rounded-full ${
                                // Aquí buscamos el proyecto completo usando proyectoSeleccionado
                                proyectos.find(
                                  (p) => p.nombre_proyecto === proyectoNombre
                                )?.estado === "activo"
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <SelectValue placeholder="Selecciona un proyecto para gestionar">
                              {/* El nombre del proyecto seleccionado se muestra aquí */}
                              {proyectoNombre}
                            </SelectValue>
                          </div>
                        ) : (
                          <SelectValue placeholder="Selecciona un proyecto para gestionar" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {proyectos_nombre && proyectos_nombre.length > 0 ? (
                          proyectos_nombre.map((proyecto, index) => (
                            <SelectItem key={index} value={proyecto}>
                              {/* Aseguramos que este div ocupe todo el ancho del SelectItem para que space-x funcione bien */}
                              <div className="flex items-center w-full">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    proyectos.find(
                                      (p) => p.nombre_proyecto === proyecto
                                    )?.estado === "activo"
                                      ? "bg-green-500"
                                      : "bg-gray-400"
                                  }`}
                                ></div>
                                {/* Ajusta este valor de 'ml-X' o 'mr-X' para controlar el espacio entre el círculo y el texto.
                                  Podrías usar 'ml-4' o 'ml-6' para más espacio.
                                  Alternativamente, puedes usar 'space-x-X' en el div padre si los agrupas.
                                */}
                                <span className="ml-3">{proyecto}</span>
                                {/* O podrías usar 'mr-3' en el div del círculo */}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-projects" disabled>
                            No hay proyectos disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {proyectos_nombre && proyectos_nombre.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Crea tu primer proyecto para comenzar
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            {proyectoNombre && (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Recaudado
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ${totalRecaudado}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600 flex items-center">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          {porcentaje}
                        </span>
                        del objetivo ${objetivo}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Inversores
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{inversores}</div>
                      <p className="text-xs text-muted-foreground">
                        +1 esta semana
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {tiempoUnidad} Restantes
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tiempoValor}</div>
                      <p className="text-xs text-muted-foreground">
                        de {tiempoValorTotal} {tiempoUnidadTotal} totales
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="proyecto">Mi Proyecto</TabsTrigger>
                    <TabsTrigger value="inversores">Inversores</TabsTrigger>
                    <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
                    <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  </TabsList>
                  <TabsContent value="proyecto" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Estado del Proyecto</CardTitle>
                              <Badge className="bg-green-100 text-green-800">
                                {estado}
                              </Badge>
                            </div>
                            <CardDescription>{descripcion}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold">
                                Descripción
                              </h4>
                              <div className="text-justify text-sm">
                                {descripcionExtendida}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Progreso del financiamiento
                                </span>
                                <span className="text-sm font-semibold">
                                  {porcentaje}% completado
                                </span>
                              </div>
                              <Progress
                                value={porcentaje}
                                className="w-full h-3"
                              />
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    Recaudado:
                                  </span>
                                  <div className="font-semibold text-green-600">
                                    ${totalRecaudado}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Objetivo:
                                  </span>
                                  <div className="font-semibold">
                                    ${objetivo}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="inversores" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Mis Inversores</CardTitle>
                        <CardDescription>
                          Lista de todos los inversores en tu proyecto
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {inversoresProyecto.length > 0 ? (
                          <div className="space-y-4">
                            {inversoresProyecto.map((inversor, index) => (
                              <div
                                key={index}
                                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                      {inversor.nombre.charAt(0)}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">
                                        {inversor.nombre} {inversor.apellido}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        {inversor.tiempo_desde_inversion}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-semibold text-green-600">
                                      ${inversor.monto_invertido}
                                    </div>
                                    <Button size="sm" variant="outline">
                                      <MessageSquare className="w-4 h-4 mr-1" />
                                      Mensaje
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No hay inversores aún.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>{" "}
                  <TabsContent value="mensajes" className="space-y-6">
                    <ListaConversaciones />
                  </TabsContent>
                  <TabsContent value="documentos" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Documentos de la Campaña</CardTitle>
                        <CardDescription>
                          Gestiona todos los documentos relacionados con tu
                          financiamiento.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Subida de documento nuevo - AÑADIR INPUTS PARA DESCRIPCION Y TIPO */}
                        <div className="mb-6 space-y-4">
                          <div>
                            <Label htmlFor="documentDescription">
                              Descripción del Documento
                            </Label>
                            <Input
                              id="documentDescription"
                              placeholder="Ej. Contrato de Inversión"
                              value={newDocumentDescription}
                              onChange={(e) =>
                                setNewDocumentDescription(e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="documentType">
                              Tipo de Documento
                            </Label>
                            <Select
                              value={newDocumentType}
                              onValueChange={setNewDocumentType}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecciona un tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Contrato">
                                  Contrato
                                </SelectItem>
                                <SelectItem value="Acuerdo">Acuerdo</SelectItem>
                                <SelectItem value="Financiero">
                                  Financiero
                                </SelectItem>
                                <SelectItem value="Legal">Legal</SelectItem>
                                <SelectItem value="Plan de Negocio">
                                  Plan de Negocio
                                </SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={handleUploadClick}
                            disabled={uploading}
                          >
                            {uploading
                              ? "Subiendo..."
                              : "Subir nuevo documento"}
                          </Button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            hidden
                          />
                          {fileName && !uploading && (
                            <p className="mt-2 text-sm text-gray-600">
                              Archivo seleccionado: {fileName}
                            </p>
                          )}
                        </div>

                        {/* Lista de documentos */}
                        {documentos.length === 0 && !uploading && (
                          <p className="text-sm text-gray-500">
                            No hay documentos aún.
                          </p>
                        )}

                        {/*Agrege esto para que reenderizara*/}
                        {Array.isArray(documentos) && documentos.length > 0 ? (
                          <div className="space-y-4">
                            {documentos.map((doc) => (
                              <div
                                key={doc.id}
                                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold">
                                      {doc.nombre}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {doc.descripcion}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Subido el{" "}
                                      {new Date(
                                        doc.creadoEn
                                      ).toLocaleDateString()}
                                    </p>
                                    {/* Mostrar el tipo de documento también */}
                                    <p className="text-xs text-gray-500">
                                      Tipo: {doc.tipo_documento}
                                    </p>
                                  </div>
                                  <div className="text-right space-y-2">
                                    <Badge
                                      className={`${
                                        doc.visibilidad === "público"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {doc.visibilidad ?? "privado"}
                                    </Badge>
                                    {doc.firmado && (
                                      <Badge className="bg-blue-100 text-blue-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Firmado
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 mt-3">
                                  {doc.firmado ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleVerifyDocument(doc.id)
                                      }
                                      disabled={verifyingId === doc.id}
                                    >
                                      {verifyingId === doc.id
                                        ? "Verificando..."
                                        : "Verificar Firma"}
                                    </Button>
                                  ) : (
                                    <Label className="text-red-600">
                                      Documento no firmado
                                    </Label>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No hay documentos aún.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
