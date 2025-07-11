
/*
    Interface for Proyecto
*/
export interface ProyectoType {
    emprendedor: string; // Nombre de la empresa
    emprendedor_id?: number; // ID de la empresa que creó el proyecto
    id: number; // Identificador único del proyecto
    categoria: string; // Categoría del proyecto (e.g., Tecnología, Salud, etc.)
    titulo: string; // Título del proyecto
    descripcion: string; // Descripción detallada del proyecto
    descripcion_extendida: string;
    monto_requerido: number; // Monto total requerido para financiar el proyecto
    monto_recaudado: number; // Monto recaudado hasta la fecha
    porcentaje: number; // Porcentaje del monto recaudado respecto al monto requerido
    fecha_inicio: string; // Fecha de inicio del proyecto (formato DD/MM/YYYY)
    fecha_fin: string; // Fecha de finalización del proyecto (formato DD/MM/YYYY)
    inversores: number; // Número de inversores que han aportado al proyecto
    estado: string; // Estado del proyecto (e.g., Activo, Finalizado, etc.)
}

export type ProyectoInvertidoType = {
    proyecto_id: number;
    titulo: string;
    descripcion: string;
    monto_invertido: string; // Monto invertido como string
    fecha_inversion: string; // Fecha de la inversión en formato ISO
    estado: string; // Estado de la inversión
    retorno_estimado: number; // Retorno estimado como porcentaje
};