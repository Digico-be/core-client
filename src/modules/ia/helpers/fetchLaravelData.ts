export const fetchLaravelData = async (endpoint: string, workspace: string): Promise<any> => {
    const url = `http://localhost:8000${endpoint}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.LARAVEL_API_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Tenant': workspace,
        },
    });
    console.log("📨 Requête Laravel :", { url, workspace });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Laravel : ${response.status} - ${errorText}`);
    }

    const text = await response.text();
    try {
        console.log(`Réponse Laravel : ${text}`);
        return JSON.parse(text);
    } catch {
        throw new Error("Erreur parsing JSON");
    }
};
