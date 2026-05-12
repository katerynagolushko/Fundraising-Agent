'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RefineSidebar from '@/components/RefineSidebar';
import { colors } from '@/design-tokens';
import type { Investor, IntroPath } from '@/types/investor';

const INVESTOR_STATUSES = ['Untouched', 'Contacted', 'Replied', 'Meeting booked', 'Warm', 'Pass', 'Dead'];
const ACCELERATOR_STATUSES = ['Not applied', 'Applied', 'Interview', 'Offer', 'Rejected'];

export default function TablePage() {
  const router = useRouter();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filter, setFilter] = useState<'all' | IntroPath>('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInvestors = async () => {
      const profileStr = localStorage.getItem('startupProfile');
      if (!profileStr) {
        router.push('/upload');
        return;
      }

      setLoading(true);
      try {
        const profile = JSON.parse(profileStr);
        const response = await fetch('/api/investors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, refinements: {} }),
        });

        if (!response.ok) throw new Error('Failed to load investors');

        const data = await response.json();
        setInvestors(data.investors);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadInvestors();
  }, [router]);

  const filteredInvestors = investors.filter(inv => filter === 'all' || inv.path === filter);

  const updateStatus = (index: number, status: string) => {
    setInvestors(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: status as any };
      return updated;
    });
  };

  const handleRefine = async (params: any) => {
    setLoading(true);
    try {
      const profileStr = localStorage.getItem('startupProfile');
      const profile = profileStr ? JSON.parse(profileStr) : {};

      const response = await fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, refinements: params }),
      });

      if (!response.ok) throw new Error('Refinement failed');

      const data = await response.json();
      setInvestors(data.investors);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (['Contacted', 'Replied', 'Applied'].includes(status)) return colors.goldLight + '40';
    if (['Warm', 'Interview'].includes(status)) return colors.greenLight;
    if (status === 'Meeting booked') return colors.red + '20';
    if (['Pass', 'Dead', 'Rejected'].includes(status)) return colors.gray100;
    return 'transparent';
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.background }}>
      <RefineSidebar investors={investors} onRefine={handleRefine} loading={loading} />

      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center gap-2">
          <h1 className="text-2xl font-semibold" style={{ color: colors.text }}>RAISE</h1>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.red }} />
        </div>

        <div className="mb-6 flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'warm', label: 'Warm' },
            { key: 'cold', label: 'Cold' },
            { key: 'apply', label: 'Apply' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: filter === key ? colors.gold : colors.white,
                color: filter === key ? colors.white : colors.text,
                border: filter === key ? 'none' : `1px solid ${colors.border}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && investors.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: colors.textMuted }}>Researching investors...</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.beige, borderBottom: `1px solid ${colors.border}` }}>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold" style={{ color: colors.textMuted }}>Investor</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold" style={{ color: colors.textMuted }}>Sector · Stage</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold" style={{ color: colors.textMuted }}>Check</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold" style={{ color: colors.textMuted }}>Path</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold" style={{ color: colors.textMuted }}>Contact</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold" style={{ color: colors.textMuted }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestors.map((investor, index) => (
                  <>
                    <tr
                      key={index}
                      onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                      className="cursor-pointer border-b hover:bg-opacity-50 transition-colors"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: getStatusColor(investor.status),
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium" style={{ color: colors.text }}>{investor.name}</div>
                        {investor.type === 'investor' ? (
                          <div className="text-sm" style={{ color: colors.textMuted }}>{investor.fund}</div>
                        ) : (
                          <div className="text-xs uppercase px-2 py-0.5 inline-block mt-1" style={{ backgroundColor: colors.red, color: colors.white }}>
                            Accelerator
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {investor.sectors.slice(0, 2).map((sector, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: colors.goldLight + '40', color: colors.goldDark }}>
                              {sector}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>{investor.checkSize}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded" style={{
                          backgroundColor: investor.path === 'warm' ? colors.greenLight : investor.path === 'cold' ? colors.goldLight + '40' : colors.gray100,
                          color: investor.path === 'warm' ? colors.green : colors.text,
                        }}>
                          {investor.path}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {investor.type === 'accelerator' ? (
                          <a href={investor.applyUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: colors.red }}>
                            Apply →
                          </a>
                        ) : (
                          <div className="flex gap-2">
                            {investor.email && (
                              <a href={`mailto:${investor.email}`} className="text-sm" style={{ color: colors.gold }}>✉️</a>
                            )}
                            {investor.linkedin && (
                              <a href={`https://linkedin.com/in/${investor.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: colors.gold }}>in</a>
                            )}
                            {investor.twitter && (
                              <a href={`https://x.com/${investor.twitter}`} target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: colors.gold }}>𝕏</a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={investor.status}
                          onChange={(e) => updateStatus(investors.indexOf(investor), e.target.value)}
                          className="px-3 py-1.5 text-sm border rounded focus:outline-none"
                          style={{ borderColor: colors.border }}
                        >
                          {(investor.type === 'investor' ? INVESTOR_STATUSES : ACCELERATOR_STATUSES).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {expandedRow === index && (
                      <tr>
                        <td colSpan={6} className="px-6 py-6" style={{ backgroundColor: colors.beigeLight }}>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              {investor.type === 'investor' ? (
                                <>
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>How to approach</h4>
                                    <p className="text-sm" style={{ color: colors.text }}>{investor.approach}</p>
                                  </div>
                                  {investor.flag && (
                                    <div>
                                      <h4 className="text-sm font-semibold mb-2" style={{ color: colors.red }}>Red flag</h4>
                                      <p className="text-sm" style={{ color: colors.text }}>{investor.flag}</p>
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>Drafted message</h4>
                                    <div className="p-4 rounded border-l-2 text-sm whitespace-pre-wrap" style={{ backgroundColor: colors.white, borderColor: colors.gold, color: colors.text }}>
                                      {investor.coldMessage}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>About this program</h4>
                                    <p className="text-sm" style={{ color: colors.text }}>{investor.acceleratorNote}</p>
                                  </div>
                                  {investor.deadline && (
                                    <div className="px-3 py-2 rounded inline-block" style={{ backgroundColor: colors.red + '20' }}>
                                      <span className="text-sm font-medium" style={{ color: colors.red }}>Deadline: {investor.deadline}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Signals right now</h4>
                              <ul className="space-y-2">
                                {investor.signals.map((signal, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <span style={{ color: colors.gold }}>•</span>
                                    <span style={{ color: colors.text }}>{signal}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
