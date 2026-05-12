'use client';

import { useState } from 'react';
import { colors } from '@/design-tokens';
import SprintTracker from './SprintTracker';
import type { Investor } from '@/types/investor';

type RefinementParams = {
  roundSize: string;
  arr: string;
  geography: string[];
  investorTypes: string[];
};

type Props = {
  investors: Investor[];
  onRefine: (params: RefinementParams) => void;
  loading: boolean;
};

export default function RefineSidebar({ investors, onRefine, loading }: Props) {
  const [params, setParams] = useState<RefinementParams>({
    roundSize: '',
    arr: '',
    geography: [],
    investorTypes: [],
  });

  const geographies = ['US', 'EU', 'Global', 'LATAM', 'MENA'];
  const investorTypes = ['Angel', 'Solo GP', 'Micro VC', 'Tier 1 VC', 'Corporate', 'Accelerator'];

  const toggleChip = (key: 'geography' | 'investorTypes', value: string) => {
    setParams(prev => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  return (
    <div className="w-52 border-r p-6 space-y-8" style={{ borderColor: colors.border, backgroundColor: colors.white }}>
      <div>
        <h3 className="text-xs uppercase font-semibold mb-4" style={{ color: colors.textMuted }}>
          Refine results
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: colors.textMuted }}>
              Raise size
            </label>
            <input
              type="text"
              value={params.roundSize}
              onChange={(e) => setParams({ ...params, roundSize: e.target.value })}
              placeholder="e.g. $2M"
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1"
              style={{ borderColor: colors.border }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: colors.textMuted }}>
              ARR
            </label>
            <input
              type="text"
              value={params.arr}
              onChange={(e) => setParams({ ...params, arr: e.target.value })}
              placeholder="e.g. $500K"
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1"
              style={{ borderColor: colors.border }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: colors.textMuted }}>
              Geography
            </label>
            <div className="flex flex-wrap gap-2">
              {geographies.map(geo => (
                <button
                  key={geo}
                  onClick={() => toggleChip('geography', geo)}
                  className="px-2 py-1 text-xs rounded transition-colors"
                  style={{
                    backgroundColor: params.geography.includes(geo) ? colors.gold : colors.beige,
                    color: params.geography.includes(geo) ? colors.white : colors.text,
                  }}
                >
                  {geo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: colors.textMuted }}>
              Investor type
            </label>
            <div className="flex flex-wrap gap-2">
              {investorTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleChip('investorTypes', type)}
                  className="px-2 py-1 text-xs rounded transition-colors"
                  style={{
                    backgroundColor: params.investorTypes.includes(type) ? colors.gold : colors.beige,
                    color: params.investorTypes.includes(type) ? colors.white : colors.text,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onRefine(params)}
          disabled={loading}
          className="w-full mt-6 px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
          style={{
            backgroundColor: colors.gold,
            color: colors.white,
          }}
        >
          {loading ? 'Refining...' : 'Refine matches'}
        </button>
      </div>

      <div className="pt-8 border-t" style={{ borderColor: colors.border }}>
        <SprintTracker investors={investors} />
      </div>
    </div>
  );
}
