import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

type RecargaType = {
    inversor_id: number;
    monto: number;
}

export async function postRecarga({
    inversor_id,
    monto
}: RecargaType, token: string) {
    return await axios.post(`${API_BASE_URL}/payment/recargar-wallet/`, {
        "inversor_id": inversor_id,
        "monto": monto
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
        .then(res => res.data)
        .catch(error => {
            console.error('Error al realizar la recarga:', error);
            throw error;
        });
};
