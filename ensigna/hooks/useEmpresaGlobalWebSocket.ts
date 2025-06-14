"use client"

import { useEffect, useRef, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Mensaje } from '@/types/mensaje';
import { getHistorialMensajes, getConversacionesEmpresa, getUsuarioInfo } from '@/api/chat';

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

export const useEmpresaGlobalWebSocket = () => {
    const [conversaciones, setConversaciones] = useState<Map<number, ConversacionActiva>>(new Map());
    const [isGlobalConnected, setIsGlobalConnected] = useState(false);
    const [empresaId, setEmpresaId] = useState<number | null>(null);
    const conexionesWS = useRef<Map<number, WebSocket>>(new Map());
    const reconnectTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

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

    // Cargar historial de mensajes para un usuario específico
    const cargarHistorialMensajes = useCallback(async (usuarioId: number, usuarioNombre: string) => {
        const empId = empresaId || getEmpresaId();
        if (!empId) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const historial = await getHistorialMensajes(empId, usuarioId, token);

            if (historial.length > 0) {
                setConversaciones(prev => {
                    const nueva = new Map(prev);
                    const conversacion = nueva.get(usuarioId) || {
                        usuario_id: usuarioId,
                        usuario_nombre: usuarioNombre,
                        mensajes: [],
                        ultima_actividad: new Date().toISOString()
                    };

                    // Convertir historial a formato local
                    conversacion.mensajes = historial.map(msg => ({
                        remitente_id: msg.remitente_id,
                        destinatario_id: msg.destinatario_id,
                        mensaje: msg.mensaje,
                        enviado_en: msg.enviado_en
                    }));

                    if (historial.length > 0) {
                        conversacion.ultima_actividad = historial[historial.length - 1].enviado_en;
                    }

                    nueva.set(usuarioId, conversacion);
                    return nueva;
                });
            }

        } catch (error) {
            console.error("Error cargando historial de mensajes:", error);
        }
    }, [empresaId, getEmpresaId]);

    // Crear o reconectar a una conversación específica
    const crearConexionConUsuario = useCallback(async (usuarioId: number, usuarioNombre?: string) => {
        const empId = empresaId || getEmpresaId();
        if (!empId) {
            console.error("No se pudo obtener el ID de la empresa");
            return;
        }

        // Filtrar usuarios ficticios (12, 13, 14)
        if ([12, 13, 14].includes(usuarioId)) {
            console.log(`Ignorando usuario ficticio ${usuarioId}`);
            return;
        }

        // Si ya existe una conexión activa, no crear otra
        const wsExistente = conexionesWS.current.get(usuarioId);
        if (wsExistente && wsExistente.readyState === WebSocket.OPEN) {
            console.log(`Ya existe conexión activa con usuario ${usuarioId}`);
            return;
        }

        // Obtener el nombre real del usuario si no se proporciona
        let nombreReal = usuarioNombre;
        if (!nombreReal) {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const userInfo = await getUsuarioInfo(usuarioId, token);
                    nombreReal = userInfo?.nombre || `Usuario ${usuarioId}`;
                } catch (error) {
                    console.error("Error obteniendo nombre del usuario:", error);
                    nombreReal = `Usuario ${usuarioId}`;
                }
            }
        }

        // Limpiar timer de reconexión si existe
        const timer = reconnectTimers.current.get(usuarioId);
        if (timer) {
            clearTimeout(timer);
            reconnectTimers.current.delete(usuarioId);
        }

        const wsUrl = `ws://localhost:8000/ws/chat/${empId}/${usuarioId}`;
        console.log(`Empresa conectando con usuario ${usuarioId}:`, wsUrl);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log(`WebSocket empresa conectado con usuario ${usuarioId}`);
            setIsGlobalConnected(true);

            // Crear o actualizar la conversación
            setConversaciones(prev => {
                const nueva = new Map(prev);
                if (!nueva.has(usuarioId)) {
                    nueva.set(usuarioId, {
                        usuario_id: usuarioId,
                        usuario_nombre: nombreReal || `Usuario ${usuarioId}`,
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
                console.log(`Empresa recibe mensaje de usuario ${usuarioId}:`, data);

                const nuevoMensaje: Mensaje = {
                    remitente_id: data.remitente_id || usuarioId,
                    destinatario_id: data.destinatario_id || empId,
                    mensaje: data.mensaje,
                    enviado_en: data.enviado_en || new Date().toISOString()
                };

                setConversaciones(prev => {
                    const nueva = new Map(prev);
                    let conversacion = nueva.get(usuarioId);

                    // Si no existe la conversación, crearla
                    if (!conversacion) {
                        conversacion = {
                            usuario_id: usuarioId,
                            usuario_nombre: data.usuario_nombre || nombreReal || `Usuario ${usuarioId}`,
                            mensajes: [],
                            ultima_actividad: new Date().toISOString()
                        };
                    }

                    // Solo agregar el mensaje si no es un duplicado
                    const yaExiste = conversacion.mensajes.some(msg =>
                        msg.mensaje === nuevoMensaje.mensaje &&
                        msg.remitente_id === nuevoMensaje.remitente_id &&
                        Math.abs(new Date(msg.enviado_en).getTime() - new Date(nuevoMensaje.enviado_en).getTime()) < 1000
                    );

                    if (!yaExiste) {
                        conversacion.mensajes.push(nuevoMensaje);
                        conversacion.ultima_actividad = nuevoMensaje.enviado_en;
                    }
                    nueva.set(usuarioId, conversacion);

                    return nueva;
                });

            } catch (error) {
                console.error("Error procesando mensaje:", error);
            }
        };

        ws.onclose = () => {
            console.log(`WebSocket empresa desconectado de usuario ${usuarioId}`);
            conexionesWS.current.delete(usuarioId);

            // Solo auto-reconectar si no es un usuario ficticio
            if (![12, 13, 14].includes(usuarioId)) {
                const timer = setTimeout(() => {
                    console.log(`Intentando reconectar con usuario ${usuarioId}...`);
                    crearConexionConUsuario(usuarioId, nombreReal);
                }, 5000);

                reconnectTimers.current.set(usuarioId, timer);
            }
        };

        ws.onerror = (error) => {
            console.error(`Error en WebSocket empresa con usuario ${usuarioId}:`, error);
            conexionesWS.current.delete(usuarioId);
        };

        conexionesWS.current.set(usuarioId, ws);
    }, [empresaId, getEmpresaId]);

    // Enviar mensaje a un usuario específico
    const enviarMensaje = useCallback((usuarioId: number, mensaje: string) => {
        const ws = conexionesWS.current.get(usuarioId);
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error(`WebSocket no disponible para usuario ${usuarioId}, creando nueva conexión...`);
            crearConexionConUsuario(usuarioId);
            return false;
        }

        try {
            ws.send(JSON.stringify({ mensaje, timestamp: Date.now() }));

            // Agregar el mensaje enviado a la conversación local
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
                        // Evitar duplicados también al enviar
                        const yaExiste = conversacion.mensajes.some(msg =>
                            msg.mensaje === mensaje &&
                            msg.remitente_id === empresaId &&
                            Math.abs(new Date(msg.enviado_en).getTime() - new Date().getTime()) < 1000
                        );

                        if (!yaExiste) {
                            conversacion.mensajes.push(mensajeEnviado);
                            conversacion.ultima_actividad = mensajeEnviado.enviado_en;
                        }
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
    }, [empresaId, crearConexionConUsuario]);

    // Cargar conversaciones existentes de la API
    const cargarConversacionesExistentes = useCallback(async () => {
        const empId = empresaId || getEmpresaId();
        if (!empId) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            console.log("Cargando conversaciones existentes...");
            const conversacionesExistentes = await getConversacionesEmpresa(empId, token);

            // Filtrar usuarios ficticios y crear conexiones WebSocket para cada conversación real
            const conversacionesReales = conversacionesExistentes.filter(conv =>
                ![12, 13, 14].includes(conv.usuario_id)
            );

            for (const conv of conversacionesReales) {
                await crearConexionConUsuario(conv.usuario_id, conv.usuario_nombre);
                await cargarHistorialMensajes(conv.usuario_id, conv.usuario_nombre);
            }

        } catch (error) {
            console.error("Error cargando conversaciones existentes:", error);
        }
    }, [empresaId, getEmpresaId, crearConexionConUsuario, cargarHistorialMensajes]);

    // Desconectar todas las conexiones
    const desconectarTodo = useCallback(() => {
        // Limpiar timers de reconexión
        reconnectTimers.current.forEach(timer => clearTimeout(timer));
        reconnectTimers.current.clear();

        // Cerrar todas las conexiones WebSocket
        conexionesWS.current.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        });
        conexionesWS.current.clear();

        setConversaciones(new Map());
        setIsGlobalConnected(false);
    }, []);    // Inicializar cuando se monta el componente
    useEffect(() => {
        const empId = getEmpresaId();
        if (empId) {
            setEmpresaId(empId);
            console.log("Empresa iniciando conexiones globales...");
            cargarConversacionesExistentes();
        }

        return () => {
            desconectarTodo();
        };
    }, [getEmpresaId, cargarConversacionesExistentes, desconectarTodo]); // Solo ejecutar una vez al montar

    return {
        conversaciones: Array.from(conversaciones.values()),
        isGlobalConnected,
        empresaId,
        crearConexionConUsuario,
        cargarHistorialMensajes,
        enviarMensaje,
        desconectarTodo
    };
};
