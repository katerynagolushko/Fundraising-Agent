import Anthropic from '@anthropic-ai/sdk';
import { ApifyClient } from 'apify-client';
import { tavily } from '@tavily/core';
import { NextRequest, NextResponse } from 'next/server';
import { ACCELERATORS } from '@/lib/accelerators';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function enrichWithTwitterSignals(investor: any) {
  if (!investor.twitter || investor.type !== 'investor') return investor;

  try {
    const run = await apifyClient.actor('apify/twitter-scraper').call({
      startUrls: [{ url: `https://x.com/${investor.twitter}` }],
      maxItems: 20,
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    const tweets = items.map((item: any) => item.text).filter(Boolean).slice(0, 15).join('\n\n');

    if (tweets) {
      const signalPrompt = `Recent tweets from ${investor.name}:
${tweets}

Write exactly 3 bullet points (max 12 words each) on what this investor is currently interested in based on their tweets. Investment themes only.

Return ONLY a JSON array of 3 strings. No markdown, no backticks.`;

      const message = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: signalPrompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);

      if (jsonMatch) {
        investor.signals = JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error(`Twitter scrape failed for ${investor.name}:`, error);
  }

  return investor;
}

async function findEmail(investor: any) {
  if (!investor.fund || investor.type !== 'investor') return investor;

  try {
    const fundWebsite = `https://${investor.fund.toLowerCase().replace(/\s+/g, '')}.com`;
    const teamPage = `${fundWebsite}/team`;
    console.log(`Finding email for ${investor.name} at ${teamPage}...`);

    const run = await apifyClient.actor('apify/web-scraper').call({
      startUrls: [{ url: teamPage }],
      pageFunction: async ({ page }: any) => {
        const text = await page.evaluate(() => document.body.innerText);
        const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        return { emails };
      },
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    const emails: string[] = (items[0]?.emails as string[]) || [];
    console.log(`Found ${emails.length} emails for ${investor.name}:`, emails.slice(0, 3));

    const relevantEmail = emails.find((email: string) =>
      email.toLowerCase().includes(investor.name.split(' ')[0].toLowerCase())
    );

    if (relevantEmail) {
      console.log(`Matched email for ${investor.name}:`, relevantEmail);
      investor.email = relevantEmail;
    } else {
      console.log(`No match, trying fallback for ${investor.name}...`);
      try {
        const fallbackRun = await apifyClient.actor('eakpbkbmzgrqwfpay').call({
          query: `${investor.name} ${investor.fund} email`,
        });

        const { items: fallbackItems } = await apifyClient.dataset(fallbackRun.defaultDatasetId).listItems();
        if (fallbackItems[0]?.email) {
          investor.email = fallbackItems[0].email;
        }
      } catch (fallbackError) {
        console.log(`Fallback email search failed for ${investor.name}`);
      }
    }
  } catch (error) {
    console.error(`Email finding failed for ${investor.name}:`, error);
  }

  // Final fallback: construct likely email if still empty
  if (!investor.email && investor.fund) {
    const firstName = investor.name.split(' ')[0].toLowerCase();
    const lastName = investor.name.split(' ').slice(-1)[0].toLowerCase();
    const domain = investor.fund.toLowerCase().replace(/\s+/g, '').replace(/ventures?|capital|partners?/g, '') + '.com';

    // Try common patterns
    investor.email = `${firstName}@${domain}`;
    console.log(`Constructed fallback email for ${investor.name}:`, investor.email);
  }

  return investor;
}

async function enrichAccelerator(investor: any) {
  if (investor.type !== 'accelerator') return investor;

  if (!investor.applyUrl && ACCELERATORS[investor.name]) {
    investor.applyUrl = ACCELERATORS[investor.name].applyUrl;
  }

  if (!investor.applyUrl) return investor;

  try {
    const run = await apifyClient.actor('apify/web-scraper').call({
      startUrls: [{ url: investor.applyUrl }],
      pageFunction: async ({ page }: any) => {
        const text = await page.evaluate(() => document.body.innerText);
        return { pageText: text.slice(0, 2000) };
      },
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    const pageText = items[0]?.pageText;

    if (pageText) {
      const deadlinePrompt = `Extract the application deadline from this text:
${pageText}

Return ONLY the deadline as a simple string (e.g., "March 15, 2026" or "Rolling"). If no deadline found, return "Rolling".`;

      const message = await anthropicClient.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 100,
        messages: [{ role: 'user', content: deadlinePrompt }],
      });

      const deadline = message.content[0].type === 'text' ? message.content[0].text.trim() : 'Rolling';
      investor.deadline = deadline;
    }
  } catch (error) {
    console.error(`Deadline scrape failed for ${investor.name}:`, error);
  }

  return investor;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, refinements } = body;

    // Step 1: Search for REAL investors with Tavily
    console.log('Searching for real investors with Tavily...');
    const searches = [
      `${profile.sector} ${profile.stage} venture capital investors ${profile.geography?.join(' ')} 2026`,
      `top VCs investing in ${profile.sector} ${profile.stage} ${profile.geography?.join(' ')}`,
      `${profile.sector} ${profile.stage} funding ${profile.geography?.join(' ')} investors`,
      `recent ${profile.sector} investments ${profile.stage}`,
    ];

    const searchPromises = searches.map(query =>
      tavilyClient.search(query, {
        maxResults: 5,
        searchDepth: 'advanced',
        includeAnswer: false,
      })
    );

    const searchResults = await Promise.all(searchPromises);
    const allResults = searchResults
      .flatMap(result => result.results)
      .map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
      }));

    console.log(`Found ${allResults.length} search results about real investors`);

    // Step 2: Claude analyzes REAL search results and ranks by fit
    const researchPrompt = `You are a world-class fundraising advisor. I've gathered real web search results about current ${profile.sector} investors. Your task is to analyze these REAL search results and identify exactly 15 investors/programs ranked by fit.

Startup profile:
- Sector: ${profile.sector}
- Stage: ${profile.stage}
- Model: ${profile.model}
- Geography: ${profile.geography?.join(', ')}
- Round size: ${profile.roundSize}
${refinements.arr ? `- ARR: ${refinements.arr}` : ''}
- Problem: ${profile.problem}
- Solution: ${profile.solution}
- Why now: ${profile.whyNow}
- Team: ${profile.founders?.map((f: any) => `${f.name} - ${f.background}`).join('; ')}
- Traction: ${profile.traction}
- Warm connections: ${profile.warmConnections}
${refinements.investorTypes?.length ? `- Preferred investor types: ${refinements.investorTypes.join(', ')}` : ''}

REAL SEARCH RESULTS FROM WEB (2026):
${allResults.map((r, i) => `
[${i + 1}] ${r.title}
URL: ${r.url}
${r.content}
`).join('\n---\n')}

CRITICAL INSTRUCTIONS:
1. ONLY include investors that are clearly mentioned in the search results above
2. Extract their real names, funds, and details from the search results
3. Verify they actually invest in this sector/stage based on search results
4. Rank by genuine fit based on what you learned from the searches
5. Include 2-3 top accelerators if stage is pre-seed
6. Be honest about red flags
7. Leave "email" empty — will be found separately
8. **IMPORTANT**: Extract LinkedIn and Twitter handles from search results
   - Look for "linkedin.com/in/..." links → extract just the handle (e.g., "johndoe")
   - Look for "twitter.com/..." or "@username" → extract handle (e.g., "johndoe")
   - Check URLs in search results for social profiles
   - If found in search results, ALWAYS include them
9. For "signals", extract 3 specific facts from search results (recent investments, tweets, thesis)

DO NOT make up or hallucinate investors. Only use information from the search results.
Every investor MUST have at least linkedin OR twitter handle if mentioned in search results.

Return ONLY valid JSON array, no markdown, no backticks:
[{
  "name": "string",
  "fund": "string — empty if accelerator",
  "type": "investor | accelerator",
  "sectors": ["string"],
  "stage": "string",
  "checkSize": "string",
  "path": "warm | cold | apply",
  "mutual": "string — empty if none",
  "email": "",
  "linkedin": "string — handle only",
  "twitter": "string — handle only",
  "approach": "2 sentences on HOW to pitch this person",
  "coldMessage": "4-6 sentence personalized outreach, first person. Empty if accelerator.",
  "signals": ["string", "string", "string"],
  "flag": "string — one honest concern or empty",
  "applyUrl": "string — if accelerator, else empty",
  "deadline": "string — if accelerator, else empty",
  "acceleratorNote": "2-3 sentence description if accelerator, else empty",
  "status": "Untouched",
  "rank": 1
}]`;

    console.log('Generating initial investor list...');
    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      messages: [{ role: 'user', content: researchPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    let jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]];
      }
    }

    if (!jsonMatch) {
      throw new Error('Failed to parse investor list');
    }

    let investors = JSON.parse(jsonMatch[0]);

    console.log(`Enriching ${investors.length} investors with signals and emails...`);

    const enrichPromises = investors.map(async (investor: any, index: number) => {
      await new Promise(resolve => setTimeout(resolve, index * 100));

      if (investor.type === 'investor') {
        investor = await enrichWithTwitterSignals(investor);
        investor = await findEmail(investor);

        // Ensure at least LinkedIn if no other contact
        if (!investor.linkedin && !investor.twitter) {
          const firstName = investor.name.split(' ')[0].toLowerCase();
          const lastName = investor.name.split(' ').slice(-1)[0].toLowerCase();
          investor.linkedin = `${firstName}-${lastName}`;
          console.log(`Constructed likely LinkedIn for ${investor.name}: ${investor.linkedin}`);
        }
      } else {
        investor = await enrichAccelerator(investor);
      }

      return investor;
    });

    investors = await Promise.all(enrichPromises);

    console.log(`Returning ${investors.length} enriched investors`);

    return NextResponse.json({ investors });
  } catch (error) {
    console.error('Investor research error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Research failed' },
      { status: 500 }
    );
  }
}
