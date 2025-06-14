"use client"

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User } from "lucide-react";
import { useEmpresaGlobalWebSocket } from '@/hooks/useEmpresaGlobalWebSocket';

interface ChatConversacionProps {
  usuarioId: number;
  usuarioNombre: string;
  onVolver: () => void;
}

export default function ChatConversacion({ usuarioId, usuarioNombre, onVolver }: ChatConversacionProps) {
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const { 
    conversaciones, 
    isGlobalConnected, 
    empresaId, 
    crearConexionConUsuario,
    enviarMensaje 
  } = useEmpresaGlobalWebSocket();
  // Encontrar la conversación actual
  const conversacionActual = conversaciones.find(conv => conv.usuario_id === usuarioId);
  const mensajes = useMemo(() => conversacionActual?.mensajes || [], [conversacionActual?.mensajes]);
  // Conectar automáticamente cuando se monta el componente
  useEffect(() => {
    crearConexionConUsuario(usuarioId, usuarioNombre);
  }, [usuarioId, usuarioNombre, crearConexionConUsuario]);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);  const handleEnviarMensaje = () => {
    if (!nuevoMensaje.trim() || !empresaId) return;

    const exitoso = enviarMensaje(usuarioId, nuevoMensaje);
    if (exitoso) {
      setNuevoMensaje("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  return (
    <div className="h-[600px] flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-gray-50 rounded-t-lg">
        <Button 
          variant="ghost" 
          onClick={onVolver}
          className="mr-2 hover:bg-gray-200"
          size="sm"
        >
          ← Volver
        </Button>        <div className="h-8 w-8 mr-3 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
          {getInitials(usuarioNombre)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{usuarioNombre}</h3>
          <p className="text-sm text-gray-500">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
              isGlobalConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            {isGlobalConnected ? "Conectado" : "Desconectado"}
          </p>
        </div>
      </div>

      {/* Area de mensajes */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
          {mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <User className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">No hay mensajes aún.<br />¡Inicia la conversación!</p>
            </div>
          ) : (
            <>
              {mensajes.map((mensaje, index) => {
                const esMio = mensaje.remitente_id === empresaId;
                
                return (
                  <div
                    key={`${mensaje.remitente_id}-${mensaje.enviado_en}-${index}`}
                    className={`flex ${esMio ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                        esMio
                          ? 'bg-green-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md border'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{mensaje.mensaje}</p>
                      <p className={`text-xs mt-1 ${
                        esMio ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {new Date(mensaje.enviado_en).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={mensajesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input para nuevo mensaje */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isGlobalConnected}
            className="flex-1 rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
          <Button 
            onClick={handleEnviarMensaje}
            disabled={!nuevoMensaje.trim() || !isGlobalConnected}
            className="bg-green-600 hover:bg-green-700 rounded-full p-2 h-10 w-10"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {!isGlobalConnected && (
          <p className="text-xs text-red-500 mt-2 flex items-center">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
            No conectado. Intentando reconectar...
          </p>
        )}
      </div>
    </div>
  );
}
