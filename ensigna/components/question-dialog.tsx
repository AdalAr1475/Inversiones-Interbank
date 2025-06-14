"use client"

import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useCallback, useRef, useEffect } from "react"
import { ProyectoType } from "@/types/proyecto"
import { CheckCircle, MessageCircle, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { jwtDecode } from "jwt-decode"
import { Input } from "@/components/ui/input"

interface QuestionDialogProps {
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

export default function QuestionDialog({ open, onOpenChange, project }: QuestionDialogProps) {
  const [message, setMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
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
  }, []);
  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Por favor, escriba su mensaje antes de enviar.");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setError("No se pudo identificar su usuario. Por favor, inicie sesión nuevamente.");
      return;
    }

    // Asumiendo que la empresa tiene ID 5 como en el ejemplo
    const empresaId = project.empresa_id || 5;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Crear conexión WebSocket para enviar el mensaje
      const wsUrl = `ws://localhost:8000/ws/chat/${userId}/${empresaId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        // Enviar el mensaje
        ws.send(JSON.stringify({ 
          mensaje: message,
          usuario_nombre: "Usuario Inversor" // Aquí podrías obtener el nombre real del usuario
        }));
        
        setSuccess(true);
        setMessage("");
        setIsSubmitting(false);
        
        // Cerrar automáticamente después de 3 segundos
        setTimeout(() => {
          setSuccess(false);
          onOpenChange(false);
          ws.close();
        }, 3000);
      };
      
      ws.onerror = (error) => {
        console.error("Error en WebSocket:", error);
        setError("No se pudo enviar su mensaje. Intente nuevamente más tarde.");
        setIsSubmitting(false);
      };
      
    } catch (err) {
      console.error("Error al enviar pregunta:", err);
      setError("No se pudo enviar su mensaje. Intente nuevamente más tarde.");
      setIsSubmitting(false);
    }
  }

  const resetDialog = () => {
    setMessage("");
    setError(null);
    setSuccess(false);
  }

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Enviar pregunta sobre el proyecto
          </DialogTitle>
          <DialogDescription>
            Envía tu pregunta o mensaje a {project.empresa} sobre el proyecto <span className="font-medium">{project.titulo}</span>.
          </DialogDescription>
        </DialogHeader>
        
        {!success ? (
          <>
            <div className="space-y-4 py-2">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="message">Tu mensaje</Label>
                <Textarea
                  id="message"
                  placeholder="Escribe aquí tu pregunta o mensaje..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Enviando..." : "Enviar pregunta"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 flex items-center justify-center rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">¡Mensaje enviado con éxito!</h3>
            <p className="text-gray-500">
              Tu pregunta ha sido enviada a {project.empresa}. <br />
              Te responderán a la brevedad posible.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
