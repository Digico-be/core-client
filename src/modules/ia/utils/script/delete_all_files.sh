#!/bin/bash

API_KEY=""
API_URL="https://api.openai.com/v1/files"
HEADERS=(-H "Authorization: Bearer $API_KEY")

echo "=== Suppression de tous les fichiers OpenAI ==="

while true; do
  # Liste les fichiers
  response=$(curl -s "$API_URL" "${HEADERS[@]}")
  file_ids=$(echo "$response" | jq -r '.data[]?.id')

  # Si aucun fichier trouvé, on arrête
  if [ -z "$file_ids" ]; then
    echo "✅ Tous les fichiers ont été supprimés."
    break
  fi

  # Supprime chaque fichier
  for file_id in $file_ids; do
    echo "Suppression du fichier $file_id"
    curl -s -X DELETE "$API_URL/$file_id" "${HEADERS[@]}" > /dev/null
  done

  echo "🔁 Encore des fichiers trouvés, on recommence..."
  sleep 1
done
