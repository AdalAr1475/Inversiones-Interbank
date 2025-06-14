// types/mensaje.d.ts
export interface Mensaje {
    id?: number;
    remitente_id: number;
    destinatario_id: number;
    mensaje: string;
    enviado_en: string;
}

export interface ConversacionGroup {
    usuario_id: number;
    usuario_nombre: string;
    ultimo_mensaje: string;
    ultimo_mensaje_fecha: string;
    mensajes_no_leidos: number;
}
