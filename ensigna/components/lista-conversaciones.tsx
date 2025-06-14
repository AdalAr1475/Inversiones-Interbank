"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import ChatConversacion from './chat-conversacion';
import { useEmpresaGlobalWebSocket } from '@/hooks/useEmpresaGlobalWebSocket';

interface Usuario {
  id: number;
  nombre: string;
  ultimoMensaje?: string;
  fechaUltimoMensaje?: string;
  mensajesNoLeidos?: number;
}

export default function ListaConversaciones() {
  const [conversacionActiva, setConversacionActiva] = useState<Usuario | null>(null);
  const { conversaciones, isGlobalConnected } = useEmpresaGlobalWebSocket();

  const formatearFecha = (fecha: string) => {
    const ahora = new Date();
    const fechaMensaje = new Date(fecha);
    const diferencia = ahora.getTime() - fechaMensaje.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    
    if (horas < 1) {
      return "Hace unos minutos";
    } else if (horas < 24) {
      return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    } else {
      const dias = Math.floor(horas / 24);
      return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  // Obtener el último mensaje de cada conversación
  const getUltimoMensaje = (conversacion: { mensajes: any[] }) => {
    if (conversacion.mensajes.length === 0) return null;
    return conversacion.mensajes[conversacion.mensajes.length - 1];
  };

  if (conversacionActiva) {
    return (
      <ChatConversacion
        usuarioId={conversacionActiva.id}
        usuarioNombre={conversacionActiva.nombre}
        onVolver={() => setConversacionActiva(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Centro de Mensajes
          <Badge variant="outline" className="ml-2">
            {isGlobalConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Comunicación en tiempo real con inversores y potenciales inversores
        </p>
      </CardHeader>
      <CardContent>
        {conversaciones.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No hay conversaciones aún</p>
            <p className="text-sm text-gray-400">
              Los inversores podrán contactarte desde la página del proyecto
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversaciones.map((conversacion) => {
              const ultimoMensaje = getUltimoMensaje(conversacion);
              
              return (
                <div
                  key={conversacion.usuario_id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setConversacionActiva({
                    id: conversacion.usuario_id,
                    nombre: conversacion.usuario_nombre
                  })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(conversacion.usuario_nombre)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{conversacion.usuario_nombre}</h3>
                          {conversacion.mensajes.length > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              {conversacion.mensajes.length}
                            </Badge>
                          )}
                        </div>
                        {ultimoMensaje && (
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {ultimoMensaje.mensaje}
                          </p>
                        )}
                        {ultimoMensaje && (
                          <p className="text-xs text-gray-400">
                            {formatearFecha(ultimoMensaje.enviado_en)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
