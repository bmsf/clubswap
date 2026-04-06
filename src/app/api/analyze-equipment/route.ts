import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert golf equipment identifier. Analyze the image and extract structured information about the golf equipment shown. Return ONLY valid JSON, no markdown, no explanation.

Return this exact structure:
{
  "category": one of ["driver", "fairway_wood", "hybrid", "iron_set", "single_iron", "wedge", "putter", "golf_bag", "golf_shoes", "rangefinder", "other"],
  "brand": string or null,
  "model": string or null,
  "year": number or null,
  "hand": "right" | "left" | null,
  "loft": number or null,
  "shaft_flex": "L" | "A" | "R" | "S" | "X" | null,
  "shaft_type": "steel" | "graphite" | null,
  "includes_headcover": true | false | null,
  "condition_estimate": "ny" | "meget_god" | "god" | "akseptabel" | null,
  "confidence": "high" | "medium" | "low"
}

If you cannot determine a field from the image, return null for that field.`

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType ?? 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Identify this golf equipment and return the JSON.',
            },
          ],
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''

    // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
    const text = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json(parsed)
    } catch {
      console.error('[analyze-equipment] Parse failed, raw response:', raw)
      return NextResponse.json({ error: 'Parse failed', raw }, { status: 500 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[analyze-equipment]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
