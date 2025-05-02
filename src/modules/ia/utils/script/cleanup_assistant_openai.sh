#!/bin/bash

API_KEY=""
API_URL="https://api.openai.com/v1"
HEADERS=(
  -H "Authorization: Bearer $API_KEY"
  -H "OpenAI-Beta: assistants=v2"
)

echo "=== Suppression complète de tous les assistants ==="

while true; do
  RESPONSE=$(curl -s "$API_URL/assistants" "${HEADERS[@]}")
  assistant_ids=$(echo "$RESPONSE" | jq -r '.data[]?.id')

  if [ -z "$assistant_ids" ]; then
    echo "✅ Tous les assistants ont bien été supprimés."
    break
  fi

  echo "$assistant_ids" | while read -r id; do
    echo "Suppression de l'assistant $id"
    curl -s -X DELETE "$API_URL/assistants/$id" "${HEADERS[@]}" > /dev/null
  done

  echo "🔁 Encore des assistants, nouvelle boucle..."
  sleep 1  # pause légère pour laisser l’API se mettre à jour
done
