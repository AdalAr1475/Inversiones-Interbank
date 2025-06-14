import axios from 'axios';
import { InversorProfile } from '../types/inversor';
const API_BASE_URL = 'http://127.0.0.1:8000/users';

/*
    Endpoints
*/



export async function getInversorProfile(token: string, idUsuario: number): Promise<InversorProfile> {
    return await axios.get(`${API_BASE_URL}/get-inversor/${idUsuario}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
        .then(res => res.data)
        .catch(error => {
            console.error('Error al obtener el perfil del inversor:', error);
            throw error;
        });
}