
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
            pageLink: (workspace: string, args?: Record<string, any>) =>
                `/${workspace}/billing/invoice` + (args?.contact_id ? `?contact_id=${args.contact_id}` : '')


        }
    }


];
