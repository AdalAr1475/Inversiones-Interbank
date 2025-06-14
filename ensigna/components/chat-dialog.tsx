"use client"

import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState, useCallback, useRef, useEffect } from "react"
import { ProyectoType } from "@/types/proyecto"
import { MessageCircle, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { jwtDecode } from "jwt-decode"
import { getHistorialMensajes, getUsuarioInfo } from "@/api/chat"

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProyectoType
}

interface DecodedToken {
  id: string
  sub: string
  tipo_usuario: string
  exp: number
}

interface MensajeChat {
  mensaje: string
  remitente: 'yo' | 'empresa'
  tiempo: string
}

export default function ChatDialog({ open, onOpenChange, project }: ChatDialogProps) {
  const [message, setMessage] = useState<string>("")
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [nombreUsuario, setNombreUsuario] = useState<string>("Usuario")
  const wsRef = useRef<WebSocket | null>(null)
  const mensajesEndRef = useRef<HTMLDivElement>(null)
  const ultimoMensajeRef = useRef<string>("")

  // Obtener el ID de usuario desde el token JWT
  const getUserId = useCallback((): number | null => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const decoded = jwtDecode<DecodedToken>(token);
      return parseInt(decoded.id);
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  }, []);  // Cargar historial de mensajes cuando se conecta
  const cargarHistorial = useCallback(async (userId: number, empresaId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Cargar nombre del usuario
      const userInfo = await getUsuarioInfo(userId, token);
      if (userInfo) {
        setNombreUsuario(userInfo.nombre);
      }

      const historial = await getHistorialMensajes(userId, empresaId, token);
      const mensajesHistorial: MensajeChat[] = historial.map(msg => ({
        mensaje: msg.mensaje,
        remitente: msg.remitente_id === userId ? 'yo' : 'empresa',
        tiempo: new Date(msg.enviado_en).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));

      setMensajes(mensajesHistorial);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  }, []);

  // Conectar al WebSocket cuando se abre el diálogo
  useEffect(() => {
    if (!open) return;

    const userId = getUserId();
    if (!userId) {
      setError("No se pudo identificar su usuario. Por favor, inicie sesión nuevamente.");
      return;
    }

    const empresaId = project.empresa_id || 5;
    
    // Cargar historial primero
    cargarHistorial(userId, empresaId);
    
    const wsUrl = `ws://localhost:8000/ws/chat/${userId}/${empresaId}`;
    
    console.log("Inversor conectando a:", wsUrl);
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket conectado");
      setIsConnected(true);
      setError(null);
    };
      ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Mensaje recibido:", data);
        
        // Solo agregar mensajes que vengan de la empresa (no los nuestros)
        if (data.remitente_id !== userId) {
          // Verificar que no sea un mensaje duplicado
          const mensajeTexto = data.mensaje;
          const tiempoActual = Date.now();
          
          // Evitar duplicados verificando si es el mismo mensaje muy seguido
          if (ultimoMensajeRef.current !== mensajeTexto || tiempoActual - (data.timestamp || 0) > 1000) {
            const nuevoMensaje: MensajeChat = {
              mensaje: mensajeTexto,
              remitente: 'empresa',
              tiempo: new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })
            };
            
            setMensajes(prev => {
              // Verificar que no existe ya este mensaje exacto
              const yaExiste = prev.some(msg => 
                msg.mensaje === nuevoMensaje.mensaje && 
                msg.remitente === nuevoMensaje.remitente &&
                Math.abs(new Date().getTime() - new Date(`2024-01-01 ${msg.tiempo}`).getTime()) < 2000
              );
              
              if (!yaExiste) {
                return [...prev, nuevoMensaje];
              }
              return prev;
            });
            
            ultimoMensajeRef.current = mensajeTexto;
          }
        }
      } catch (error) {
        console.error("Error procesando mensaje:", error);
      }
    };
    
    ws.onclose = () => {
      console.log("WebSocket desconectado");
      setIsConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error("Error en WebSocket:", error);
      setError("Error de conexión. Intente nuevamente.");
      setIsConnected(false);
    };
    
    wsRef.current = ws;

    // Cleanup al cerrar
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [open, project.empresa_id, getUserId, cargarHistorial]);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviarMensaje = () => {
    if (!message.trim() || !isConnected || !wsRef.current) {
      setError("No se puede enviar el mensaje en este momento.");
      return;
    }

    try {      // Enviar el mensaje por WebSocket
      wsRef.current.send(JSON.stringify({ 
        mensaje: message,
        usuario_nombre: nombreUsuario,
        timestamp: Date.now()
      }));
      
      // Agregar el mensaje a la lista local
      const nuevoMensaje: MensajeChat = {
        mensaje: message,
        remitente: 'yo',
        tiempo: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setMensajes(prev => [...prev, nuevoMensaje]);
      setMessage("");
      setError(null);
      
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setError("No se pudo enviar el mensaje. Intente nuevamente.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };
  const resetDialog = () => {
    setMessage("");
    setMensajes([]);
    setError(null);
    setIsConnected(false);
    setNombreUsuario("Usuario");
    ultimoMensajeRef.current = "";
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetDialog();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Chat con {project.empresa}
          </DialogTitle>
          <DialogDescription>
            Chatea en tiempo real sobre el proyecto <span className="font-medium">{project.titulo}</span>.
            <span className={`ml-2 text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '● Conectado' : '● Desconectado'}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto border rounded-md p-4 mb-4 bg-gray-50 min-h-[300px] max-h-[400px]">
            {mensajes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay mensajes aún. ¡Inicia la conversación!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mensajes.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.remitente === 'yo' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.remitente === 'yo'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-900 border'
                      }`}
                    >
                      <p className="text-sm">{msg.mensaje}</p>
                      <p className={`text-xs mt-1 ${
                        msg.remitente === 'yo' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {msg.tiempo}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={mensajesEndRef} />
              </div>
            )}
          </div>

          {/* Input para nuevo mensaje */}
          <div className="flex space-x-2">
            <Input
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button 
              onClick={handleEnviarMensaje}
              disabled={!message.trim() || !isConnected}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {!isConnected && (
            <p className="text-xs text-red-500 mt-1">
              No conectado. Intentando reconectar...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
