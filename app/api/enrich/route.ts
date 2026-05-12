import Anthropic from '@anthropic-ai/sdk';
import { ApifyClient } from 'apify-client';
import { NextRequest, NextResponse } from 'next/server';
import { ACCELERATORS } from '@/lib/accelerators';

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

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

    const relevantEmail = emails.find((email: string) =>
      email.toLowerCase().includes(investor.name.split(' ')[0].toLowerCase())
    );

    if (relevantEmail) {
      investor.email = relevantEmail;
      investor.emailVerified = true;
    } else {
      try {
        const fallbackRun = await apifyClient.actor('eakpbkbmzgrqwfpay').call({
          query: `${investor.name} ${investor.fund} email`,
        });

        const { items: fallbackItems } = await apifyClient.dataset(fallbackRun.defaultDatasetId).listItems();
        if (fallbackItems[0]?.email) {
          investor.email = fallbackItems[0].email;
          investor.emailVerified = true;
        }
      } catch (fallbackError) {
        console.log(`Fallback email search failed for ${investor.name}`);
      }
    }
  } catch (error) {
    console.error(`Email finding failed for ${investor.name}:`, error);
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
    const { investor } = await request.json();

    console.log(`Enriching ${investor.name}...`);

    let enriched = { ...investor };

    if (investor.type === 'investor') {
      enriched = await enrichWithTwitterSignals(enriched);
      enriched = await findEmail(enriched);
    } else {
      enriched = await enrichAccelerator(enriched);
    }

    return NextResponse.json({ investor: enriched });
  } catch (error) {
    console.error('Enrichment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Enrichment failed' },
      { status: 500 }
    );
  }
}
