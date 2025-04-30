import { NextResponse } from 'next/server'

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
})

export async function POST(req: Request) {
    try {
        const { fileId } = await req.json()

        if (!fileId) {
            return NextResponse.json({ error: 'fileId manquant' }, { status: 400 })
        }

        const deleted = await openai.files.del(fileId)

        return NextResponse.json(deleted)
    } catch (err: any) {
        console.error('❌ Erreur suppression fichier OpenAI :', err)
        return NextResponse.json({ error: err?.message || 'Erreur suppression fichier' }, { status: 500 })
    }
}