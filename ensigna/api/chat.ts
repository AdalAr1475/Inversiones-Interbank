// api/chat.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface HistorialMensaje {
    id: number;
    remitente_id: number;
    destinatario_id: number;
    mensaje: string;
    enviado_en: string;
    remitente_nombre?: string;
    destinatario_nombre?: string;
}

// Obtener historial de mensajes entre dos usuarios
export const getHistorialMensajes = async (
    usuario1_id: number,
    usuario2_id: number,
    token: string
): Promise<HistorialMensaje[]> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/historial/${usuario1_id}/${usuario2_id}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error obteniendo historial de mensajes:', error);
        return [];
    }
};

// Obtener conversaciones de una empresa (lista de usuarios que han enviado mensajes)
export const getConversacionesEmpresa = async (
    empresa_id: number,
    token: string
): Promise<Array<{ usuario_id: number, usuario_nombre: string, ultimo_mensaje: string, fecha_ultimo_mensaje: string }>> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/conversaciones/${empresa_id}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error obteniendo conversaciones de empresa:', error);
        return [];
    }
};

// Obtener información básica de un usuario (nombre)
export const getUsuarioInfo = async (
    usuario_id: number,
    token: string
): Promise<{ id: number, nombre: string } | null> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/chat/usuario/${usuario_id}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error obteniendo información del usuario:', error);
        return null;
    }
};
