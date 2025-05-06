'use client'

import { AiOutlineInfoCircle } from 'react-icons/ai'
import { Tooltip } from 'react-tooltip'
import { Form } from '@digico/ui'

import 'react-tooltip/dist/react-tooltip.css'

export const AssistantFields = () => (
  <>
    {/* Informations de base */}
    <Form.Group>
      <Form.Row>
        <Form.Field
          name="name"
          label={
            <>
              Nom de l’assistant
              <span
                data-tooltip-id="tooltip-name"
                data-tooltip-content="Choisissez un nom clair pour cet assistant, par exemple “Assistant de facturation”."
                className="inline-block ml-1 cursor-pointer"
              >
                <AiOutlineInfoCircle className="w-4 h-4 text-gray-500" />
              </span>
              <Tooltip id="tooltip-name" place="top" />
            </>
          }
          placeholder="Assistant de facturation"
        />

        <Form.Field
          name="type"
          label={
            <>
              Usage
              <span
                data-tooltip-id="tooltip-type"
                data-tooltip-content="Sélectionnez “Général” pour un assistant polyvalent ou “Spécialisé” pour un domaine précis."
                className="inline-block ml-1 cursor-pointer"
              >
                <AiOutlineInfoCircle className="w-4 h-4 text-gray-500" />
              </span>
              <Tooltip id="tooltip-type" place="top" />
            </>
          }
          placeholder="Général ou Spécialisé"
        />

        <Form.Field
          name="module"
          label={
            <>
              Domaine spécifique
              <span
                data-tooltip-id="tooltip-module"
                data-tooltip-content="Si vous avez choisi “Spécialisé”, indiquez le domaine (ex. facturation, ressources humaines)."
                className="inline-block ml-1 cursor-pointer"
              >
                <AiOutlineInfoCircle className="w-4 h-4 text-gray-500" />
              </span>
              <Tooltip id="tooltip-module" place="top" />
            </>
          }
          placeholder="facturation, hr, etc."
        />
      </Form.Row>
    </Form.Group>

    {/* Paramètres techniques */}
    <Form.Group>
      <Form.Row>
        <Form.Field
          name="model"
          label="Modèle OpenAI"
          placeholder="gpt-4.1-2025-04-14"
        />

        <Form.Field
          name="temperature"
          label="Créativité"
          type="number"
          step="0.1"
        />

        <Form.Field
          name="max_tokens_output"
          label="Longueur max. réponse"
          type="number"
        />
      </Form.Row>
    </Form.Group>

    {/* Persona et instructions */}
    <Form.Group>
      <Form.Row>
        <Form.Field
          name="persona"
          label="Rôle de l'assistant"
          placeholder="Ex. Expert RH, Coach sportif"
        />
      </Form.Row>
    </Form.Group>

    <Form.Group title="Instructions système">
      <Form.Row>
        <Form.Field
          type="textarea"
          name="instructions"
          label={
            <>
              Consignes globales
              <span
                data-tooltip-id="tooltip-instructions"
                data-tooltip-content="Indiquez comment l’assistant doit se comporter (ex. rester factuel, toujours vérifier les informations)."
                className="inline-block ml-1 cursor-pointer"
              >
                <AiOutlineInfoCircle className="w-4 h-4 text-gray-500" />
              </span>
              <Tooltip id="tooltip-instructions" place="top" />
            </>
          }
        />
      </Form.Row>
    </Form.Group>

    {/* Règles et prompts */}
    <Form.Group title="Règles">
      <Form.Row>
        <Form.Field
          type="textarea"
          name="rules"
          label="Règles à respecter"
          placeholder='["Ne jamais inventer", "Utiliser un ton clair"]'
        />
      </Form.Row>
    </Form.Group>

    <Form.Group title="Prompts suggérés">
      <Form.Row>
        <Form.Field
          type="textarea"
          name="suggested_prompts"
          label="Suggestions pour démarrer"
          placeholder='["Comment puis-je t’aider ?", "Explique-moi mes options"]'
        />
      </Form.Row>
    </Form.Group>
  </>
)

