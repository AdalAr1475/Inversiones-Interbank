

export type TransferRequestType = {
    amount_cents: number;
    connected_account_id?: string; // Optional, default is "acct_1RZ2NuBOgx1Ph13F"
    description?: string; // Optional, default is ""
    inversor_id?: string; // Optional, default is None
    proyecto_id?: string; // Optional, default is None
    tipo?: string; // Optional, default is "transferencia"
};