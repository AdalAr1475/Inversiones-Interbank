import axios from 'axios';
import { ProyectoType, ProyectoInvertidoType } from '../types/proyecto';
const API_BASE_URL = 'http://127.0.0.1:8000/project';

/*
    Endpoints
*/
export async function getDetailsProyecto(id: number, token: string): Promise<ProyectoType> {
    return await axios.get(`${API_BASE_URL}/${id}/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
        .then(res => res.data)
        .catch(error => {
            console.error('Error al obtener los detalles del proyecto:', error);
            throw error;
        });
}

export async function getProyectosInvertidos(usuarioId: number, token: string): Promise<ProyectoInvertidoType[]> {
    return await axios.get(`${API_BASE_URL}/proyectos-invertidos/${usuarioId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
        .then(res => res.data)
        .catch(error => {
            console.error('Error al obtener los proyectos invertidos:', error);
            throw error;
        });
}