import axios from "axios";
const API_BASE_URL = "http://localhost:8000/invest";

export interface InvestSummary {
    porfolio_total: number;
    proyectos_activos: number;
    proyectos_disponibles: number;
}

export async function getInvestSummary(usuario_id: number, token: string): Promise<InvestSummary> {
    return await axios.get(`${API_BASE_URL}/dashboard/${usuario_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then(res => res.data)
        .catch(error => {
            console.error("Error al obtener el resumen de inversiones:", error);
            throw error;
        });
}