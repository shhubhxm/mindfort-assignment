import { NextRequest, NextResponse } from 'next/server';
import { getSharedVulnerabilitiesSummary, getCompositeRiskInsight } from '@/lib/enrichment';
import { buildGraph } from '@/lib/graph';
import raw from '@/data/findings.json';
import type { Finding } from '@/types/finding';

const findingsRaw = raw as Finding[];

export async function GET() {
  const graph = buildGraph();
  return NextResponse.json(graph);
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const lcPrompt = prompt.toLowerCase();

    // Enrich context based on prompt intent
    const enrichments: string[] = [];

    if (lcPrompt.includes('share') && lcPrompt.includes('component')) {
      enrichments.push(getSharedVulnerabilitiesSummary());
    }

    if (
      lcPrompt.includes('composite') ||
      lcPrompt.includes('multi') ||
      lcPrompt.includes('chain') ||
      lcPrompt.includes('step') ||
      lcPrompt.includes('attack')
    ) {
      const insight = getCompositeRiskInsight(findingsRaw);
      if (insight) enrichments.push(insight);
    }

    const enrichedContext = enrichments.join('\n\n');

    console.log('\n Enriched Context:\n', enrichedContext);

    const fullPrompt = `${enrichedContext}\n\nUser Question: ${prompt}`;

    const response = await fetch(`${process.env.LITELLM_BASE_URL}v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LITELLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'system',
            content:
              'You are a security assistant. If shared components or composite risks are present, use that in your answer.',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      }),
    });

    const rawResponse = await response.text();
    const json = JSON.parse(rawResponse);

    return NextResponse.json({
      response: json.choices?.[0]?.message?.content ?? '🤖 LLM did not return content.',
    });
  } catch (err: any) {
    console.error(' Chat API crashed:', err);
    return NextResponse.json({ response: 'Server crashed internally' }, { status: 500 });
  }
}
