import axios from 'axios';
const API_BASE_URL = 'http://127.0.0.1:8000/stripe';
import { TransferRequestType } from "../types/stripe"

/*
    Endpoints
*/


export async function createCustomer(fullname: string, email: string): Promise<string> {
    return await axios.post(`${API_BASE_URL}/create-customer`, {
        fullname,
        email
    })
        .then(res => res.data.customer_id)
        .catch(error => {
            console.error('Error al crear el cliente en Stripe:', error);
            throw error;
        });
}

export async function createConnectedAccount(email: string, businessType: string, country: string): Promise<any> {
    return await axios.post(`${API_BASE_URL}/create-connected-account`, {
        email,
        business_type: businessType,
        country
    })
        .then(res => res.data)
        .catch(error => {
            console.error('Error al crear la cuenta conectada en Stripe:', error);
            throw error;
        });
}

export async function createOnboardingLink(accountId: string, returnUrl: string, refreshUrl: string): Promise<string> {
    return await axios.post(`${API_BASE_URL}/create-onboarding-link`, {
        account_id: accountId,
        return_url: returnUrl,
        refresh_url: refreshUrl
    })
        .then(res => res.data.onboarding_url)
        .catch(error => {
            console.error('Error al crear el enlace de onboarding en Stripe:', error);
            throw error;
        });
}

export async function createCheckoutSession(userId: number, amountCents: number): Promise<string> {
    return await axios.post(`${API_BASE_URL}/create-checkout-session`, {
        user_id: userId,
        amount_cents: amountCents
    })
        .then(res => res.data.checkout_url)
        .catch(error => {
            console.error('Error al crear la sesión de pago en Stripe:', error);
            throw error;
        });
}

export async function transferFunds(transferRequest: TransferRequestType): Promise<{ transferId: string, status: string }> {
    return await axios.post(`${API_BASE_URL}/transfer-funds`, transferRequest)
        .then(res => ({
            transferId: res.data.transfer_id,
            status: res.data.status
        }))
        .catch(error => {
            console.error('Error al transferir fondos a la cuenta conectada en Stripe:', error);
            throw error;
        });
}