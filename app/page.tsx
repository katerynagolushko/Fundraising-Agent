'use client';

import { useState } from 'react';
import InvestorForm from '@/components/InvestorForm';
import InvestorTable from '@/components/InvestorTable';

export type Investor = {
  name: string;
  fund: string;
  checkSize: string;
  whyFit: string;
  redFlag: string;
  introPath: 'warm' | 'cold' | 'apply';
  mutual: string;
  approach: string;
  coldMessage: string;
  signals: string[];
  status?: string;
};

export default function Home() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: Record<string, string>) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze');
      }

      const data = await response.json();
      setInvestors(data.investors.map((inv: Investor) => ({ ...inv, status: 'Not contacted' })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (index: number, status: string) => {
    setInvestors(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status };
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Fundraising Agent</h1>

        {investors.length === 0 ? (
          <InvestorForm onSubmit={handleSubmit} loading={loading} error={error} />
        ) : (
          <div>
            <button
              onClick={() => setInvestors([])}
              className="mb-6 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← New Search
            </button>
            <InvestorTable investors={investors} onUpdateStatus={updateStatus} />
          </div>
        )}
      </div>
    </div>
  );
}
