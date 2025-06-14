"use client";

import {
  ArrowUpRight,
  Users,
  DollarSign,
  Calendar,
  Lock,
  TrendingUp,
  Plus,
  Eye,
  MessageSquare,
  CheckCircle,
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
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";

//Interfaces
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

export default function DashboardEmpresa() {
  
  //Hooks
  const [proyectoId, setProyectoId] = useState<number>(1); // Simulando un ID de proyecto
  const [documentos, setDocumentos] = useState<DocumentoProyecto[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

   // --- Nuevos Hooks para manejar el estado de firma y verificación ---
  const [signingId, setSigningId] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  // --- Nuevo estado para el tipo de documento ---
  const [newDocumentType, setNewDocumentType] = useState<string>("Contrato"); // Valor por defecto
  const [newDocumentDescription, setNewDocumentDescription] = useState<string>("Documento subido desde UI"); // Para la descripción


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
        await axios.post("http://localhost:8000/documents/registrar-documento", {
          proyecto_id: proyectoId,
          nombre: file.name,
          descripcion: newDocumentDescription, // Usa el estado para la descripción
          contenido_base64: base64Content,
          tipo_documento: newDocumentType,    // ¡Envía el tipo de documento!
          visibilidad: "privado", // o público según el caso
        });

        console.log("Documento registrado con éxito para el proyecto ID:", proyectoId);

        // Actualiza lista de documentos después de la subida
        const res = await axios.get(`http://localhost:8000/documents/documentos/${proyectoId}`);
        console.log("Documentos recibidos y actualizados:", res.data);
        setDocumentos(res.data);
        
      } catch (error: any) {
        console.error("Error al registrar documento:", error);
        if (axios.isAxiosError(error) && error.response) {
            console.error("Detalles del error del backend (subida):", error.response.data);
            alert(`Error al registrar documento: ${error.response.data.detail || "Error desconocido del servidor."}`);
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

  // Función para firmar un documento
  const handleSignDocument = async (documentId: number) => {
    setSigningId(documentId); // Inicia el estado de carga para este documento

    // Paso 1: Encontrar el documento específico en tu estado 'documentos'
    const documentToSign = documentos.find((doc) => doc.id === documentId);

    if (!documentToSign) {
      alert("Error: Documento no encontrado para firmar.");
      setSigningId(null);
      return;
    }

    // Paso 2: Extraer los datos necesarios del documento y del usuario
    const contenidoBase64 = documentToSign.contenidoBase64;
    const tipoDocumento = documentToSign.tipo_documento; // Obtiene tipo_documento del documento
    const userId = 1; // <--- ¡IMPORTANTE! REEMPLAZA ESTO CON EL ID REAL DEL USUARIO AUTENTICADO

    if (!contenidoBase64) {
      alert("Error: El contenido del documento en Base64 no está disponible.");
      setSigningId(null);
      return;
    }
    if (!tipoDocumento) { // Validación adicional para tipo_documento
        alert("Error: El tipo de documento no está disponible.");
        setSigningId(null);
        return;
    }

    try {
      // Paso 3: Realizar la solicitud POST enviando TODOS los campos requeridos por el backend
      const response = await axios.post("http://localhost:8000/documents/firmar-documento", {
        documento_id: documentToSign.id,
        contenido_base64: contenidoBase64,
        usuario_id: userId,
        tipo_documento: tipoDocumento, // ¡Envía el tipo_documento!
      });

      // Actualizar el estado del documento en el frontend (marcarlo como firmado)
      setDocumentos((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === documentId ? { ...doc, firmado: true, tx_hash: response.data.tx_hash } : doc
        )
      );

      alert(response.data.mensaje || "Documento firmado con éxito"); // El backend devuelve "mensaje"

    } catch (error: any) {
      console.error("Error al firmar el documento:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Detalles del error del backend (firma):", error.response.data);
        alert(`Error al firmar el documento: ${error.response.data.detail || "Error desconocido del servidor."}`);
      } else if (axios.isAxiosError(error) && error.request) {
        alert("No se pudo conectar con el servidor. Verifique su conexión.");
      } else {
        alert("Ocurrió un error inesperado al firmar el documento.");
      }
    } finally {
      setSigningId(null); // Finaliza el estado de carga
    }
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
        const response = await axios.post("http://localhost:8000/documents/verify-document", {
            document_id: documentId,
            // Aquí podrías necesitar enviar contenido_base64 y tipo_documento si el backend lo requiere para verificar
        });

        // Asumimos que el backend responde con una estructura como: { "success": boolean, "message": "..." }
        if (response.data.success) {
            alert(`Verificación exitosa: ${response.data.message}`);
        } else {
            alert(`Verificación fallida: ${response.data.message}`);
        }

    } catch (error) {
        console.error("Error al verificar la firma:", error);
        alert("Error en la verificación. El documento podría haber sido alterado o la firma no es válida.");
    } finally {
        setVerifyingId(null); // Finaliza el estado de carga
    }
  };

  useEffect(() => {
    if(!proyectoId) return;
    // Aquí podrías consumir una API que traiga los documentos
    fetch(`http://localhost:8000/documents/documentos/${proyectoId}`) // Ejemplo
      .then((res) => res.json())
      .then((data) => {
      console.log('Documentos recibidos:', data);
      setDocumentos(data);
      });
  }, []);

  return (
    <ProtectedRoute requiredRole="empresa">
      <div className="min-h-screen bg-gray-50">
        <HeaderLat />
        <div className="ml-56 transition-all duration-300">
          {/* Main Content */}

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Empresa
              </h1>
              <p className="text-gray-600">
                Gestiona tu campaña de financiamiento y conecta con inversores
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Recaudado
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    $425,000
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      85%
                    </span>
                    del objetivo ($500K)
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
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">
                    +3 esta semana
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Días Restantes
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    de 60 días totales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Visualizaciones
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">
                    +89 esta semana
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="campana" className="space-y-6">
              <TabsList>
                <TabsTrigger value="campana">Mi Campaña</TabsTrigger>
                <TabsTrigger value="inversores">Inversores</TabsTrigger>
                <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="campana" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Estado de la Campaña</CardTitle>
                          <Badge className="bg-green-100 text-green-800">
                            Activa
                          </Badge>
                        </div>
                        <CardDescription>
                          TechStart AI - Plataforma de IA para automatización
                          empresarial
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Progreso del financiamiento
                            </span>
                            <span className="text-sm font-semibold">
                              85% completado
                            </span>
                          </div>
                          <Progress value={85} className="w-full h-3" />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Recaudado:</span>
                              <div className="font-semibold text-green-600">
                                $425,000
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Objetivo:</span>
                              <div className="font-semibold">$500,000</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Nueva inversión de $25,000
                              </p>
                              <p className="text-xs text-gray-600">
                                Roberto Silva • Hace 2 horas
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Nuevo mensaje de inversor
                              </p>
                              <p className="text-xs text-gray-600">
                                María González • Hace 5 horas
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                89 nuevas visualizaciones
                              </p>
                              <p className="text-xs text-gray-600">
                                Esta semana
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Acciones Rápidas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Actualizar Campaña
                        </Button>
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Mensaje a Inversores
                        </Button>
                        <Button variant="outline" className="w-full">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Ver Análisis
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Métricas Clave</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Tasa de conversión
                          </span>
                          <span className="text-sm font-semibold">18.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Inversión promedio
                          </span>
                          <span className="text-sm font-semibold">$18,478</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Tiempo promedio
                          </span>
                          <span className="text-sm font-semibold">
                            3.2 días
                          </span>
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
                      Lista de todos los inversores en tu campaña
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            R
                          </div>
                          <div>
                            <h3 className="font-semibold">Roberto Silva</h3>
                            <p className="text-sm text-gray-600">
                              Inversor Ángel • Hace 2 horas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            $25,000
                          </div>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Mensaje
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            M
                          </div>
                          <div>
                            <h3 className="font-semibold">María González</h3>
                            <p className="text-sm text-gray-600">
                              Empresaria • Hace 1 día
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            $15,000
                          </div>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Mensaje
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            C
                          </div>
                          <div>
                            <h3 className="font-semibold">Carlos Rodríguez</h3>
                            <p className="text-sm text-gray-600">
                              Fondo de Inversión • Hace 3 días
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            $50,000
                          </div>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Mensaje
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>              <TabsContent value="mensajes" className="space-y-6">
                <ListaConversaciones />
              </TabsContent>

              <TabsContent value="documentos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos de la Campaña</CardTitle>
                  <CardDescription>
                    Gestiona todos los documentos relacionados con tu financiamiento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Subida de documento nuevo - AÑADIR INPUTS PARA DESCRIPCION Y TIPO */}
                    <div className="mb-6 space-y-4">
                      <div>
                        <Label htmlFor="documentDescription">Descripción del Documento</Label>
                        <Input
                          id="documentDescription"
                          placeholder="Ej. Contrato de Inversión"
                          value={newDocumentDescription}
                          onChange={(e) => setNewDocumentDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="documentType">Tipo de Documento</Label>
                        <Select value={newDocumentType} onValueChange={setNewDocumentType}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Contrato">Contrato</SelectItem>
                            <SelectItem value="Acuerdo">Acuerdo</SelectItem>
                            <SelectItem value="Financiero">Financiero</SelectItem>
                            <SelectItem value="Legal">Legal</SelectItem>
                            <SelectItem value="Plan de Negocio">Plan de Negocio</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleUploadClick} disabled={uploading}>
                        {uploading ? "Subiendo..." : "Subir nuevo documento"}
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleUpload} hidden />
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

                    <div className="space-y-4">
                      {documentos.map((doc) => (
                        <div key={doc.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{doc.nombre}</h3>
                              <p className="text-sm text-gray-600">{doc.descripcion}</p>
                              <p className="text-xs text-gray-500">
                                Subido el {new Date(doc.creadoEn).toLocaleDateString()}
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
                                  <CheckCircle className="w-3 h-3 mr-1"/>
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
                                onClick={() => handleVerifyDocument(doc.id)}
                                disabled={verifyingId === doc.id}
                              >
                                {verifyingId === doc.id ? "Verificando..." : "Verificar Firma"}
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleSignDocument(doc.id)}
                                disabled={signingId === doc.id}
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                {signingId === doc.id ? "Firmando..." : "Firmar digitalmente"}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
