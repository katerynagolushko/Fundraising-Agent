'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewCard from '@/components/ReviewCard';
import { colors } from '@/design-tokens';

type ExtractedProfile = {
  sector: string;
  stage: string;
  roundSize: string;
  model: string;
  geography: string[];
  problem: string;
  solution: string;
  whyNow: string;
  founders: Array<{ name: string; background: string; linkedin: string }>;
  traction: string;
  warmConnections: string;
  confidence: Record<string, 'high' | 'medium' | 'low'>;
};

export default function ReviewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ExtractedProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('extractedProfile');
    if (stored) {
      setProfile(JSON.parse(stored));
    } else {
      router.push('/upload');
    }
  }, [router]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <p style={{ color: colors.textMuted }}>Loading...</p>
      </div>
    );
  }

  const handleUpdate = (key: string, value: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [key]: value };
      localStorage.setItem('extractedProfile', JSON.stringify(updated));
      return updated;
    });
  };

  const handleContinue = () => {
    localStorage.setItem('startupProfile', JSON.stringify(profile));
    router.push('/table');
  };

  const startupFields = [
    { label: 'Sector', value: profile.sector, confidence: profile.confidence.sector, key: 'sector' },
    { label: 'Stage', value: profile.stage, confidence: profile.confidence.stage, key: 'stage' },
    { label: 'Round size', value: profile.roundSize, confidence: profile.confidence.roundSize, key: 'roundSize' },
    { label: 'Model', value: profile.model, key: 'model' },
    { label: 'Geography', value: profile.geography.join(', '), confidence: profile.confidence.geography, key: 'geography' },
  ];

  const storyFields = [
    { label: 'Problem', value: profile.problem, confidence: profile.confidence.problem, key: 'problem', multiline: true },
    { label: 'Solution', value: profile.solution, confidence: profile.confidence.solution, key: 'solution', multiline: true },
    { label: 'Why now', value: profile.whyNow, confidence: profile.confidence.whyNow, key: 'whyNow', multiline: true },
    { label: 'Traction', value: profile.traction, confidence: profile.confidence.traction, key: 'traction', multiline: true },
  ];

  const teamFields = [
    { label: 'Founders', value: profile.founders.map(f => f.name).join(', '), key: 'founders' },
    { label: 'Background', value: profile.founders.map(f => f.background).join(' • '), key: 'background', multiline: true },
    { label: 'Warm connections', value: profile.warmConnections, key: 'warmConnections', multiline: true },
  ];

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-2">
          <h1 className="text-2xl font-semibold" style={{ color: colors.text }}>
            RAISE
          </h1>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.red }} />
        </div>

        <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: colors.goldLight + '30' }}>
          <svg className="w-5 h-5 mt-0.5" style={{ color: colors.gold }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm" style={{ color: colors.goldDark }}>
            Click any field to edit. Fields marked "needs review" weren't clear in your deck.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ReviewCard title="Your startup" fields={startupFields} onUpdate={handleUpdate} />
          <ReviewCard title="Your story" fields={storyFields} onUpdate={handleUpdate} />
          <div className="md:col-span-2">
            <ReviewCard title="Team" fields={teamFields} onUpdate={handleUpdate} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-3 rounded-lg font-medium border transition-all"
            style={{
              borderColor: colors.border,
              color: colors.textMuted,
              backgroundColor: 'transparent',
            }}
          >
            Re-upload
          </button>

          <button
            onClick={handleContinue}
            className="px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: colors.red,
              color: colors.white,
            }}
          >
            Find my investors
          </button>
        </div>
      </div>
    </div>
  );
}
