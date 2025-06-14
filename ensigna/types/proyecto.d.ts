
/*
    Interface for Proyecto
*/

export interface ProyectoType {
    empresa_id: number;
    id: number;
    descripcion: string;
    monto_recaudado: number;
    titulo: string;
    monto_requerido: number;
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
    estado: 'activo' | 'finalizado' | 'cancelado';
}