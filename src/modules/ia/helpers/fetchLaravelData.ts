import { cookiesNext } from '@digico/utils'

export const fetchLaravelData = async (endpoint: string, workspace: string): Promise<any> => {
    const url = `http://localhost:8000${endpoint}`;
    console.debug("🌐 [fetchLaravelData] Envoi GET vers :", { url, workspace });

    // Récupérer les cookies ou les informations d'authentification via cookiesNext ou autre mécanisme
    const cookies = await cookiesNext();

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': cookies.get('Authorization') || '',  // Utiliser les cookies ou stockage local pour l'auth
            'Content-Type': 'application/json',
            'X-Tenant': workspace,
        },
    });

    const contentType = response.headers.get('content-type') ?? '';
    const raw = await response.text();

    if (!response.ok) {
        console.error("❌ [fetchLaravelData] Erreur Laravel :", response.status, raw.slice(0, 500)); // coupe à 500 chars
        throw new Error(`Erreur Laravel : ${response.status} - ${raw.slice(0, 200)}`);
    }

    if (!contentType.includes('application/json')) {
        console.warn("⚠️ [fetchLaravelData] Réponse non-JSON :", raw.slice(0, 500));
        throw new Error("Réponse inattendue, JSON attendu");
    }

    try {
        const parsed = JSON.parse(raw);
        console.debug("✅ [fetchLaravelData] Réponse parsée :", parsed);
        return parsed;
    } catch (e) {
        console.error("❌ [fetchLaravelData] JSON.parse échoué :", e, raw.slice(0, 500));
        throw new Error("Erreur parsing JSON");
    }
};
