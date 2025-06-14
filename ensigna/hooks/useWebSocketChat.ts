"use client"

import { useEffect, useRef, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Mensaje } from '@/types/mensaje';

interface DecodedToken {
    id: string;
    sub: string;
    tipo_usuario: string;
    exp: number;
}

interface UseWebSocketChatProps {
    destinatario_id?: number;
}

export const useWebSocketChat = ({ destinatario_id }: UseWebSocketChatProps = {}) => {
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [empresaId, setEmpresaId] = useState<number | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Obtener el ID de la empresa desde el token JWT
    const getEmpresaId = useCallback((): number | null => {
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

    // Conectar al WebSocket
    const conectar = useCallback((targetUserId: number) => {
        const empId = getEmpresaId();
        if (!empId) {
            console.error("No se pudo obtener el ID de la empresa");
            return;
        }

        setEmpresaId(empId);

        // Cerrar conexión existente si hay una
        if (wsRef.current) {
            wsRef.current.close();
        }

        const wsUrl = `ws://localhost:8000/ws/chat/${empId}/${targetUserId}`;
        console.log("Conectando a:", wsUrl);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket conectado");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Mensaje recibido:", data);

                const nuevoMensaje: Mensaje = {
                    remitente_id: data.remitente_id,
                    destinatario_id: data.destinatario_id,
                    mensaje: data.mensaje,
                    enviado_en: data.enviado_en
                };

                setMensajes(prev => [...prev, nuevoMensaje]);
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
            setIsConnected(false);
        };

        wsRef.current = ws;
    }, [getEmpresaId]);
    // Enviar mensaje
    const enviarMensaje = useCallback((mensaje: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket no está conectado");
            return false;
        }

        try {
            wsRef.current.send(JSON.stringify({ mensaje }));
            return true;
        } catch (error) {
            console.error("Error enviando mensaje:", error);
            return false;
        }
    }, []);

    // Desconectar
    const desconectar = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        setMensajes([]);
    }, []);

    // Limpiar al desmontar el componente
    useEffect(() => {
        return () => {
            desconectar();
        };
    }, [desconectar]);

    // Auto-conectar si se proporciona destinatario_id
    useEffect(() => {
        if (destinatario_id) {
            conectar(destinatario_id);
        }

        return () => {
            if (destinatario_id) {
                desconectar();
            }
        };
    }, [destinatario_id, conectar, desconectar]);

    return {
        mensajes,
        isConnected,
        empresaId,
        conectar,
        enviarMensaje,
        desconectar,
        setMensajes
    };
};
