'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors } from '@/design-tokens';

type FormData = {
  sector: string;
  stage: string;
  geography: string[];
  roundSize: string;
  model: string;
  problem: string;
  solution: string;
  whyNow: string;
  founders: Array<{ name: string; background: string; linkedin: string }>;
  traction: string;
  warmConnections: string;
};

export default function ManualPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    sector: '',
    stage: 'pre-seed',
    geography: [],
    roundSize: '',
    model: 'B2B SaaS',
    problem: '',
    solution: '',
    whyNow: '',
    founders: [{ name: '', background: '', linkedin: '' }],
    traction: '',
    warmConnections: '',
  });

  const steps = ['Startup Basics', 'Your Story', 'Team & Traction'];

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGeography = (geo: string) => {
    setFormData(prev => ({
      ...prev,
      geography: prev.geography.includes(geo)
        ? prev.geography.filter(g => g !== geo)
        : [...prev.geography, geo],
    }));
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    const profile = {
      ...formData,
      confidence: {
        sector: 'high',
        stage: 'high',
        roundSize: 'high',
        geography: 'high',
        problem: 'high',
        solution: 'high',
        whyNow: 'high',
        traction: 'high',
      },
    };
    localStorage.setItem('startupProfile', JSON.stringify(profile));
    router.push('/table');
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-2">
          <h1 className="text-2xl font-semibold" style={{ color: colors.text }}>RAISE</h1>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.red }} />
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-between">
          {steps.map((label, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all"
                  style={{
                    backgroundColor: index <= step ? colors.gold : colors.beige,
                    color: index <= step ? colors.white : colors.textMuted,
                  }}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-2" style={{ color: index <= step ? colors.text : colors.textMuted }}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="flex-1 h-1 mx-4"
                  style={{ backgroundColor: index < step ? colors.gold : colors.border }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-8" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
          {/* Step 0: Startup Basics */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium mb-6" style={{ color: colors.text }}>Startup Basics</h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Sector</label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => updateField('sector', e.target.value)}
                  placeholder="e.g., FinTech, HealthTech, AI"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => updateField('stage', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  >
                    <option value="pre-seed">Pre-seed</option>
                    <option value="seed">Seed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Round Size</label>
                  <input
                    type="text"
                    value={formData.roundSize}
                    onChange={(e) => updateField('roundSize', e.target.value)}
                    placeholder="e.g., $500K, $2M"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Business Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                >
                  <option value="B2B SaaS">B2B SaaS</option>
                  <option value="B2C">B2C</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="Deep tech">Deep tech</option>
                  <option value="Dev tools">Dev tools</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: colors.text }}>Geography</label>
                <div className="flex flex-wrap gap-2">
                  {['US', 'EU', 'Global', 'LATAM', 'MENA', 'Asia'].map(geo => (
                    <button
                      key={geo}
                      type="button"
                      onClick={() => toggleGeography(geo)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                      style={{
                        backgroundColor: formData.geography.includes(geo) ? colors.gold : colors.beige,
                        color: formData.geography.includes(geo) ? colors.white : colors.text,
                      }}
                    >
                      {geo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Your Story */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium mb-6" style={{ color: colors.text }}>Your Story</h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Problem</label>
                <textarea
                  value={formData.problem}
                  onChange={(e) => updateField('problem', e.target.value)}
                  placeholder="What problem are you solving? (max 300 chars)"
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: colors.border }}
                />
                <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  {formData.problem.length}/300
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Solution</label>
                <textarea
                  value={formData.solution}
                  onChange={(e) => updateField('solution', e.target.value)}
                  placeholder="How does your product solve this? (max 300 chars)"
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: colors.border }}
                />
                <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  {formData.solution.length}/300
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Why Now</label>
                <textarea
                  value={formData.whyNow}
                  onChange={(e) => updateField('whyNow', e.target.value)}
                  placeholder="Why is now the right time? (max 150 chars)"
                  rows={3}
                  maxLength={150}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: colors.border }}
                />
                <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  {formData.whyNow.length}/150
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team & Traction */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium mb-6" style={{ color: colors.text }}>Team & Traction</h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Founder Name</label>
                <input
                  type="text"
                  value={formData.founders[0].name}
                  onChange={(e) => {
                    const updated = [...formData.founders];
                    updated[0] = { ...updated[0], name: e.target.value };
                    updateField('founders', updated);
                  }}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Background</label>
                <textarea
                  value={formData.founders[0].background}
                  onChange={(e) => {
                    const updated = [...formData.founders];
                    updated[0] = { ...updated[0], background: e.target.value };
                    updateField('founders', updated);
                  }}
                  placeholder="Previous companies, expertise, relevant experience (max 200 chars)"
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: colors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>Traction</label>
                <textarea
                  value={formData.traction}
                  onChange={(e) => updateField('traction', e.target.value)}
                  placeholder="Revenue, users, growth metrics, partnerships"
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: colors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  Warm Connections <span className="font-normal" style={{ color: colors.textMuted }}>(optional)</span>
                </label>
                <textarea
                  value={formData.warmConnections}
                  onChange={(e) => updateField('warmConnections', e.target.value)}
                  placeholder="Names of VCs, angels, or advisors you know"
                  rows={2}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: colors.border }}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
            <button
              onClick={step === 0 ? () => router.push('/upload') : handleBack}
              className="px-6 py-3 rounded-lg font-medium transition-all border"
              style={{
                borderColor: colors.border,
                color: colors.textMuted,
                backgroundColor: 'transparent',
              }}
            >
              {step === 0 ? '← Back to Upload' : '← Previous'}
            </button>

            <button
              onClick={step === 2 ? handleSubmit : handleNext}
              className="px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: step === 2 ? colors.red : colors.gold,
                color: colors.white,
              }}
            >
              {step === 2 ? 'Find Investors' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
