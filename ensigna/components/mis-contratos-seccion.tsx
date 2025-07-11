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
import { use, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger, Separator } from "@radix-ui/react-select";
import { jwtDecode } from "jwt-decode";
import { redirect, useRouter, useSearchParams } from "next/navigation";

//Interfaces
interface DocumentoProyecto {
  id: number;
  inversion_id: number;
  nombre_documento: string;
  descripcion_documento: string;
  contenido_base64?: string; // <--- ¡Asegúrate de que esta propiedad exista!
  tipo_documento: string;
  creado_en: string;
  firmado: boolean;
  visibilidad: "público" | "privado";
}

interface Inversion {
  proyecto_nombre: number
  inversor_id: number;
  fecha_inversion: string
  id: number
  monto_invertido: number;
  estado: string;
}

// --- Define las props que el componente recibirá ---
interface MisContratosSeccionProps {
  selectedInversionId?: string | null;
}

export const MisContratosSeccion = ({
  selectedInversionId,
}: MisContratosSeccionProps) => {
  //Hooks
  const [usuarioId, setUsuarioId] = useState<number>(0);
  const [inversiones, setInversiones] = useState<Inversion[]>([]);
  const [inversionId, setInversionId] = useState<number>(0);
  const [documentos, setDocumentos] = useState<DocumentoProyecto[]>([]);
  const [loadingInversiones, setLoadingInversiones] = useState(true);

  // --- Nuevos Hooks para manejar el estado de firma y verificación ---
  const [signingId, setSigningId] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  //Enrutador
  const searchParams = useSearchParams();

  // Función para firmar un documento
  const handleSignDocument = async (documentId: number) => {
    console.log("Firmando documento con ID:", documentId);
    console.log("Detalle del documento:", documentos);
    setSigningId(documentId); // Inicia el estado de carga para este documento

    // Paso 1: Encontrar el documento específico en tu estado 'documentos'
    const documentToSign = documentos.find((doc) => doc.id === documentId);

    if (!documentToSign) {
      alert("Error: Documento no encontrado para firmar.");
      setSigningId(null);
      return;
    }

    // Paso 2: Extraer los datos necesarios del documento y del usuario
    const contenido_base64 = documentToSign.contenido_base64;
    const tipoDocumento = documentToSign.tipo_documento; // Obtiene tipo_documento del documento
    const userId = usuarioId; 

    if (!contenido_base64) {
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
        `http://localhost:8000/documents/firmar-documento/${documentId}`,

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
        `http://localhost:8000/documents/verify-document/${documentId}`,

      );

      //El backend devuelve un booleano indicando si la firma es válida
      if (response.data) {
        alert("La firma del documento es válida.");
      }
      else {
        alert("La firma del documento NO es válida.");
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

  //Para manejar cambios en el selector de inversiones
  const handleInversionChange = (id: string) => {
    setInversionId(parseInt(id, 10));
  };

  //Sección para obtener id de usuario
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  interface DecodedToken {
    id: number;
    email: string;
    tipo_usuario: string;
    exp: number;
  }

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      setUsuarioId(Number(decodedToken.id));
    } else {
      redirect("/auth/login");
    }
  });

  // Efecto para traer los contratos cuando cambie la inversionID seleccionada
  useEffect(() => {
    if (!inversionId) {
      setDocumentos([]); // Limpia los documentos si no hay inversión seleccionada
      return;
    };
    console.log("Cargando documentos para la inversión:", inversionId);
    fetch(`http://localhost:8000/documents/contrato-por-inversion/${inversionId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Documentos cargados:", data);
        setDocumentos(data);
      })
      .catch((error) => {
        console.error("Error al cargar documentos:", error)
        setDocumentos([]); // Limpia los documentos en caso de error
      });
  }, [inversionId]); // Correcto, depende solo de inversionId


  // Efecto para traer las inversiones CUANDO tengamos el usuarioId
  useEffect(() => {
    if (!usuarioId) return; // No hacer nada si no tenemos el ID de usuario

    setLoadingInversiones(true);
    fetch(`http://localhost:8000/invest/get-inversiones-usuario/${usuarioId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInversiones(data);
        }
      })
      .catch(error => console.error("Error al cargar inversiones:", error))
      .finally(() => setLoadingInversiones(false));
  }, [usuarioId]); // Depende de usuarioId


 // Efecto para seleccionar la inversión que viene de la URL (prop)
  // Se ejecuta cuando la prop 'selectedInversionId' cambia O cuando la lista de 'inversiones' se carga.
  useEffect(() => {
    if (selectedInversionId && inversiones.length > 0) {
      const idNum = parseInt(selectedInversionId, 10);
      const inversionExiste = inversiones.some(inv => Number(inv.id) === idNum);
      console.log(inversionExiste)

      if (inversionExiste) {
        setInversionId(idNum); // ¡Aquí se establece el valor para el <Select>!
      }
    }
  }, [selectedInversionId, inversiones]);

  return (
    
    <Card>
      <CardHeader>
        <CardTitle>Documentos de la Campaña</CardTitle>
        <CardDescription>
          Gestiona todos los documentos relacionados con tu financiamiento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* --- SELECTOR DE INVERSIONES --- */}
        <div>
          <Label htmlFor="inversion-selector">Selecciona una Inversión</Label>
          <Select
            value={inversionId ? inversionId.toString() : ""} // Controlado por el estado
            onValueChange={handleInversionChange}
            disabled={loadingInversiones} // Deshabilitar mientras carga
          >
            <SelectTrigger id="inversion-selector">
              <SelectValue placeholder="Elige una inversión..." />
            </SelectTrigger>
            <SelectContent>
              {inversiones.length > 0 ? (
                inversiones.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id.toString()}>
                    {inv.proyecto_nombre} - ${inv.monto_invertido ? inv.monto_invertido.toLocaleString() : "0"}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-inversiones" disabled>
                  No tienes inversiones todavía.
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <Separator className="my-4"/>
        {/* Lista de documentos */}
        {/* Si no hay inversión seleccionada, muestra un mensaje */}
        {!inversionId && (
          <p className="text-sm text-gray-500">
            Por favor, selecciona una inversión para ver sus documentos.
          </p>
        )}

        {/* Cuando hay inversión pero no documentos */}
        {inversionId && documentos.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay documentos para esta inversión.
          </p>
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
                    <h3 className="font-semibold">{doc.nombre_documento}</h3>
                    <p className="text-sm text-gray-600">{doc.descripcion_documento}</p>
                    <p className="text-xs text-gray-500">
                      Subido el {new Date(doc.creado_en).toLocaleDateString()}
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
            <p className="text-sm text-gray-500">
              Hubo un error al cargar los documentos.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
