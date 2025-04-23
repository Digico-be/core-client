import { NextResponse } from 'next/server'

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1'
})

export async function POST(req: Request) {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
        return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    try {
        const openaiFile = await openai.files.create({
            file,
            purpose: 'assistants'
        })

        return NextResponse.json(openaiFile)
    } catch (err: any) {
        console.error('Erreur upload fichier OpenAI :', err)
        return NextResponse.json({ error: err?.message || 'Erreur upload OpenAI' }, { status: 500 })
    }
}
