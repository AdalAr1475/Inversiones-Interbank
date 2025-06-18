import { CheckCircle, Lock } from "lucide-react";
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

export default function MisContratosSeccion() {
  //Hooks
  const [proyectoId, setProyectoId] = useState<number>(1); // Simulando un ID de proyecto
  const [documentos, setDocumentos] = useState<DocumentoProyecto[]>([]);

  // --- Nuevos Hooks para manejar el estado de firma y verificación ---
  const [signingId, setSigningId] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

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
    if (!tipoDocumento) {
      // Validación adicional para tipo_documento
      alert("Error: El tipo de documento no está disponible.");
      setSigningId(null);
      return;
    }

    try {
      // Paso 3: Realizar la solicitud POST enviando TODOS los campos requeridos por el backend
      const response = await axios.post(
        "http://localhost:8000/documents/firmar-documento",
        {
          documento_id: documentToSign.id,
          contenido_base64: contenidoBase64,
          usuario_id: userId,
          tipo_documento: tipoDocumento, // ¡Envía el tipo_documento!
        }
      );

      // Actualizar el estado del documento en el frontend (marcarlo como firmado)
      setDocumentos((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === documentId
            ? { ...doc, firmado: true, tx_hash: response.data.tx_hash }
            : doc
        )
      );

      alert(response.data.mensaje || "Documento firmado con éxito"); // El backend devuelve "mensaje"
    } catch (error: any) {
      console.error("Error al firmar el documento:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "Detalles del error del backend (firma):",
          error.response.data
        );
        alert(
          `Error al firmar el documento: ${
            error.response.data.detail || "Error desconocido del servidor."
          }`
        );
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

  useEffect(() => {
    if (!proyectoId) return;
    // Aquí podrías consumir una API que traiga los documentos
    fetch(`http://localhost:8000/documents/documentos/${proyectoId}`) // Ejemplo
      .then((res) => res.json())
      .then((data) => {
        console.log("Documentos recibidos:", data);
        setDocumentos(data);
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos de la Campaña</CardTitle>
        <CardDescription>
          Gestiona todos los documentos relacionados con tu financiamiento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Lista de documentos */}
        {Array.isArray(documentos) && documentos.length === 0 && (
          <p className="text-sm text-gray-500">No hay documentos aún.</p>
        )}

        <div className="space-y-4">
          {Array.isArray(documentos) ? (
          
            documentos.map((doc) => (
              <div
                key={doc.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
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
                      onClick={() => handleVerifyDocument(doc.id)}
                      disabled={verifyingId === doc.id}
                    >
                      {verifyingId === doc.id
                        ? "Verificando..."
                        : "Verificar Firma"}
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
                      {signingId === doc.id
                        ? "Firmando..."
                        : "Firmar digitalmente"}
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Hubo un error al cargar los documentos.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
