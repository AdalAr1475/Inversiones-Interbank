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

interface ConversacionActiva {
    usuario_id: number;
    usuario_nombre: string;
    mensajes: Mensaje[];
    ultima_actividad: string;
}

export const useEmpresaWebSocket = () => {
    const [conversaciones, setConversaciones] = useState<Map<number, ConversacionActiva>>(new Map());
    const [isConnected, setIsConnected] = useState(false);
    const [empresaId, setEmpresaId] = useState<number | null>(null);
    const conexionesWS = useRef<Map<number, WebSocket>>(new Map());

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
    }, []);    // Conectar a un chat específico con un usuario
    const conectarConUsuario = useCallback((usuarioId: number, usuarioNombre: string) => {
        const empId = getEmpresaId();
        if (!empId) {
            console.error("No se pudo obtener el ID de la empresa");
            return;
        }

        setEmpresaId(empId);

        // Si ya existe una conexión, no crear otra
        if (conexionesWS.current.has(usuarioId)) {
            return;
        }

        const wsUrl = `ws://localhost:8000/ws/chat/${empId}/${usuarioId}`;
        console.log("Empresa conectando a:", wsUrl);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log(`WebSocket conectado con usuario ${usuarioId}`);
            setIsConnected(true);

            // Agregar la conversación si no existe
            setConversaciones(prev => {
                const nueva = new Map(prev);
                if (!nueva.has(usuarioId)) {
                    nueva.set(usuarioId, {
                        usuario_id: usuarioId,
                        usuario_nombre: usuarioNombre,
                        mensajes: [],
                        ultima_actividad: new Date().toISOString()
                    });
                }
                return nueva;
            });
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(`Mensaje recibido de usuario ${usuarioId}:`, data);

                const nuevoMensaje: Mensaje = {
                    remitente_id: data.remitente_id || usuarioId,
                    destinatario_id: data.destinatario_id || empId,
                    mensaje: data.mensaje,
                    enviado_en: data.enviado_en || new Date().toISOString()
                };

                // Actualizar la conversación específica
                setConversaciones(prev => {
                    const nueva = new Map(prev);
                    let conversacion = nueva.get(usuarioId);

                    // Si no existe la conversación, crearla
                    if (!conversacion) {
                        conversacion = {
                            usuario_id: usuarioId,
                            usuario_nombre: data.usuario_nombre || `Usuario ${usuarioId}`,
                            mensajes: [],
                            ultima_actividad: new Date().toISOString()
                        };
                    }

                    conversacion.mensajes.push(nuevoMensaje);
                    conversacion.ultima_actividad = nuevoMensaje.enviado_en;
                    nueva.set(usuarioId, conversacion);

                    return nueva;
                });

            } catch (error) {
                console.error("Error procesando mensaje:", error);
            }
        };

        ws.onclose = () => {
            console.log(`WebSocket desconectado de usuario ${usuarioId}`);
            conexionesWS.current.delete(usuarioId);
        };

        ws.onerror = (error) => {
            console.error(`Error en WebSocket con usuario ${usuarioId}:`, error);
            conexionesWS.current.delete(usuarioId);
        };

        conexionesWS.current.set(usuarioId, ws);
    }, [getEmpresaId]);

    // Enviar mensaje a un usuario específico
    const enviarMensaje = useCallback((usuarioId: number, mensaje: string) => {
        const ws = conexionesWS.current.get(usuarioId);
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error(`WebSocket no está conectado con usuario ${usuarioId}`);
            return false;
        }

        try {
            ws.send(JSON.stringify({ mensaje }));

            // Agregar el mensaje enviado a la conversación
            if (empresaId) {
                const mensajeEnviado: Mensaje = {
                    remitente_id: empresaId,
                    destinatario_id: usuarioId,
                    mensaje,
                    enviado_en: new Date().toISOString()
                };

                setConversaciones(prev => {
                    const nueva = new Map(prev);
                    const conversacion = nueva.get(usuarioId);
                    if (conversacion) {
                        conversacion.mensajes.push(mensajeEnviado);
                        conversacion.ultima_actividad = mensajeEnviado.enviado_en;
                        nueva.set(usuarioId, conversacion);
                    }
                    return nueva;
                });
            }

            return true;
        } catch (error) {
            console.error("Error enviando mensaje:", error);
            return false;
        }
    }, [empresaId]);

    // Desconectar todas las conexiones
    const desconectarTodo = useCallback(() => {
        conexionesWS.current.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        });
        conexionesWS.current.clear();
        setConversaciones(new Map());
        setIsConnected(false);
    }, []);

    // Limpiar al desmontar el componente
    useEffect(() => {
        return () => {
            desconectarTodo();
        };
    }, [desconectarTodo]);

    // Inicializar empresa ID
    useEffect(() => {
        const empId = getEmpresaId();
        setEmpresaId(empId);
    }, [getEmpresaId]);

    return {
        conversaciones: Array.from(conversaciones.values()),
        isConnected,
        empresaId,
        conectarConUsuario,
        enviarMensaje,
        desconectarTodo
    };
};
