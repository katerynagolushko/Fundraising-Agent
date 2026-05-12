import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const linkedinUrlsStr = formData.get('linkedinUrls') as string;
    const linkedinUrls = JSON.parse(linkedinUrlsStr || '[]');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let deckText = '';

    if (file.type === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      deckText = data.text;
    } else if (file.type.includes('presentation')) {
      const result = await mammoth.extractRawText({ buffer });
      deckText = result.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const extractionPrompt = `You are extracting a structured startup profile from a founder's pitch deck.

Deck text:
${deckText}

Founder LinkedIn URLs (plain context — not scraped):
${linkedinUrls.join(', ')}

Return ONLY valid JSON, no markdown, no backticks:
{
  "sector": "string",
  "stage": "pre-seed | seed",
  "roundSize": "string",
  "model": "B2B SaaS | B2C | Marketplace | Deep tech | Dev tools | Fintech | Hardware",
  "geography": ["US", "EU"],
  "problem": "max 300 chars",
  "solution": "max 300 chars",
  "whyNow": "max 150 chars",
  "founders": [{ "name": "string", "background": "max 200 chars", "linkedin": "string" }],
  "traction": "string",
  "warmConnections": "string",
  "confidence": {
    "sector": "high | medium | low",
    "stage": "high | medium | low",
    "roundSize": "high | medium | low",
    "geography": "high | medium | low",
    "problem": "high | medium | low",
    "solution": "high | medium | low",
    "whyNow": "high | medium | low",
    "traction": "high | medium | low"
  }
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: extractionPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]];
      }
    }

    if (!jsonMatch) {
      throw new Error('Failed to parse extraction response');
    }

    const profile = JSON.parse(jsonMatch[0]);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    );
  }
}
