import axios from 'axios';
import { ProyectoType } from '../types/proyecto';
const API_BASE_URL = 'http://127.0.0.1:8000';

/*
    Endpoints
*/
export async function getDetailsProyecto(id: number, token: string): Promise<ProyectoType> {
    return await axios.get(`${API_BASE_URL}/project/${id}/`, {
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