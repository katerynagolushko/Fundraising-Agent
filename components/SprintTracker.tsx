'use client';

import { colors } from '@/design-tokens';
import type { Investor } from '@/types/investor';

type Props = {
  investors: Investor[];
};

export default function SprintTracker({ investors }: Props) {
  const counts = {
    contacted: investors.filter(i => ['Contacted', 'Replied', 'Applied'].includes(i.status)).length,
    warm: investors.filter(i => ['Warm', 'Interview', 'Meeting booked'].includes(i.status)).length,
    meetings: investors.filter(i => i.status === 'Meeting booked').length,
    passed: investors.filter(i => ['Pass', 'Dead', 'Rejected'].includes(i.status)).length,
  };

  const StatItem = ({ label, count, color }: { label: string; count: number; color: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: colors.textMuted }}>{label}</span>
      <span className="text-lg font-semibold" style={{ color }}>{count}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b" style={{ borderColor: colors.border }}>
        <p className="text-xs uppercase font-semibold mb-1" style={{ color: colors.textMuted }}>
          Sprint Tracker
        </p>
        <p className="text-sm" style={{ color: colors.text }}>Week 1 of 2</p>
      </div>

      <div className="space-y-1">
        <StatItem label="Contacted" count={counts.contacted} color={colors.gold} />
        <StatItem label="Warm" count={counts.warm} color={colors.gold} />
        <StatItem label="Meetings" count={counts.meetings} color={colors.red} />
        <StatItem label="Passed" count={counts.passed} color={colors.textMuted} />
      </div>
    </div>
  );
}
