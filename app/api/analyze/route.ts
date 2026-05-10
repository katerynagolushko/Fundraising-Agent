import Anthropic from '@anthropic-ai/sdk';
import { tavily } from '@tavily/core';
import { NextRequest, NextResponse } from 'next/server';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sector,
      problem,
      solution,
      stage,
      geography,
      businessModel,
      roundSize,
      teamBackground,
      traction,
      warmConnections,
    } = body;

    // Perform multiple searches to find real investors
    const searches = [
      `${sector} ${stage} venture capital investors ${geography} 2026`,
      `best VCs for ${sector} startups ${stage} ${geography}`,
      `top ${stage} investors ${sector} portfolio companies`,
      `${geography} venture capital firms ${sector} focus`,
    ];

    console.log('Searching for investors...');
    const searchPromises = searches.map(query =>
      tavilyClient.search(query, {
        maxResults: 5,
        searchDepth: 'advanced',
        includeAnswer: false,
      })
    );

    const searchResults = await Promise.all(searchPromises);

    // Combine and format search results
    const allResults = searchResults
      .flatMap(result => result.results)
      .map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
      }));

    console.log(`Found ${allResults.length} search results`);

    // Use Claude to analyze search results and create structured recommendations
    const analysisPrompt = `You are an expert fundraising advisor. I've gathered real web search results about ${sector} investors in ${geography}. Your task is to analyze these search results and identify exactly 10 real investors/VCs ranked by fit for this startup.

STARTUP DETAILS:
- Sector: ${sector}
- Stage: ${stage}
- Geography: ${geography}
- Round Size: ${roundSize}
- Business Model: ${businessModel}
- Problem: ${problem}
- Solution: ${solution}
- Team Background: ${teamBackground}
- Traction: ${traction}
- Warm Connections: ${warmConnections || 'None specified'}

SEARCH RESULTS FROM WEB:
${allResults.map((r, i) => `
[${i + 1}] ${r.title}
URL: ${r.url}
${r.content}
`).join('\n---\n')}

TASK: Based ONLY on the search results above, identify exactly 10 real investors or VC firms that would be the best fit. Rank them by relevance. For each investor:

1. Extract their real name and firm from the search results
2. Verify they actually exist and invest in this sector/stage
3. Only include investors that are clearly mentioned in the search results
4. Do NOT make up or hallucinate any information

For each investor, provide:
- name: Full name of the partner/investor (from search results)
- fund: Name of the VC firm (from search results)
- checkSize: Typical check size if mentioned, otherwise estimate based on stage
- whyFit: Based on portfolio companies or thesis mentioned in search results
- redFlag: Any concerns or if information is limited, note that
- introPath: "warm" (if user mentioned connection), "cold", or "apply" (if firm has application process)
- mutual: Name from warmConnections if relevant, otherwise "N/A"
- approach: Best strategy based on what you learned from search results
- coldMessage: Personalized 3-paragraph cold email referencing specific info from search results
- signals: 3 specific facts from the search results (portfolio companies, recent investments, thesis statements)

CRITICAL: Only include investors that are actually mentioned in the search results. If you can't find 10, return fewer. Do not hallucinate.

Return ONLY valid JSON in this exact format:

{
  "investors": [
    {
      "name": "...",
      "fund": "...",
      "checkSize": "...",
      "whyFit": "...",
      "redFlag": "...",
      "introPath": "warm" | "cold" | "apply",
      "mutual": "...",
      "approach": "...",
      "coldMessage": "...",
      "signals": ["...", "...", "..."]
    }
  ]
}`;

    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]];
      }
    }

    if (!jsonMatch) {
      throw new Error('Failed to parse response from Claude');
    }

    const result = JSON.parse(jsonMatch[0]);

    console.log(`Returning ${result.investors?.length || 0} investors`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze startup' },
      { status: 500 }
    );
  }
}
