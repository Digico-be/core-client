import { getTenantUrl } from '@digico/utils'

export const functionsDefinition = [
    {
        type: "function" as const,
        function: {
            name: "getAllInvoices",
            description: "Récupère toutes les factures via la route GET /api/invoices. Les factures peuvent être filtrées par contact, statut ou date.",
            parameters: {
                type: "object",
                properties: {
                    endpoint: {
                        type: "string",
                        default: "/api/invoices",
                        description: "L'endpoint pour récupérer les factures"
                    },
                    contact_id: {
                        type: "string",
                        description: "Filtrer les factures pour un contact spécifique (ID)"
                    },
                    status: {
                        type: "string",
                        description: "Filtrer les factures par statut (ex: draft, sent, paid, etc.)"
                    },
                    date: {
                        type: "string",
                        description: "Filtrer les factures par date (format YYYY-MM-DD)"
                    },
                },
            },
            pageLink: (_workspace: string, args?: any): string => {
                const baseUrl = getTenantUrl('/billing/invoice');
                const params = new URLSearchParams();

                if (args?.contact_id) params.append('contact_id', args.contact_id);
                if (args?.status) params.append('status', args.status);
                if (args?.date) params.append('date', args.date);

                return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
            }
        }
    }


];
