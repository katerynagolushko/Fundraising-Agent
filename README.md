# Fundraising Agent

AI-powered investor matching tool for founders. Built with Next.js and Claude AI.

## Features

- **Real-Time Web Search**: Uses Tavily to find actual, current investors (no hallucinations!)
- **Smart Matching**: Analyzes your startup details and finds the 10 best-fit investors
- **Detailed Insights**: Get personalized recommendations with intro paths, approach strategies, and cold message templates
- **Track Progress**: Manage outreach status for each investor
- **Filter & Sort**: Filter by intro path (warm/cold/apply)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your API keys:**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   ```
   
   Get your keys from:
   - Anthropic API: https://console.anthropic.com/
   - Tavily API (web search): https://tavily.com/ (free tier available)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Fill out the form with your startup details:
   - Sector, stage, geography
   - Problem and solution
   - Business model and round size
   - Team background and traction
   - Warm connections (optional)

2. Click "Find Investors" to get AI-powered recommendations

3. Browse the results table:
   - View investor fit scores and intro paths
   - Click rows to see detailed signals and cold message templates
   - Update status as you progress with outreach
   - Use filter pills to focus on specific intro paths

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Anthropic Claude API** - AI-powered analysis (claude-sonnet-4-5)
- **Tavily Search API** - Real-time web search for accurate investor data

## Project Structure

```
├── app/
│   ├── api/analyze/route.ts    # API endpoint for Claude AI
│   ├── page.tsx                # Main page component
│   └── layout.tsx              # Root layout
├── components/
│   ├── InvestorForm.tsx        # Startup details form
│   └── InvestorTable.tsx       # Results table with filters
└── .env.local                  # Environment variables (not committed)
```

## License

MIT
