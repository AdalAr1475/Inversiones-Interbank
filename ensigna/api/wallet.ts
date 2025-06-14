import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/payment';

export interface WalletBalance {
    inversor_id: number;
    saldo: string;  // The API returns the saldo as a string
}

export async function getWalletBalance(token: string, idUsuario: number): Promise<WalletBalance> {
    return await axios.get(`${API_BASE_URL}/wallet/${idUsuario}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
        .then(res => res.data)
        .catch(error => {
            console.error('Error al obtener el saldo del wallet:', error);
            throw error;
        });
}

export async function getRecargas(token: string, idUsuario: number): Promise<unknown[]> {
    return await axios.get(`${API_BASE_URL}/recargas/${idUsuario}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
        .then(res => res.data)
        .catch(error => {
            console.error('Error al obtener las recargas del wallet:', error);
            throw error;
        });
}
