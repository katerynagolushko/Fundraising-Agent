'use client';

import { useState } from 'react';
import type { Investor } from '@/app/page';

type Props = {
  investors: Investor[];
  onUpdateStatus: (index: number, status: string) => void;
};

const STATUS_OPTIONS = ['Not contacted', 'Reached out', 'In conversation', 'Passed', 'Invested'];

export default function InvestorTable({ investors, onUpdateStatus }: Props) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'warm' | 'cold' | 'apply'>('all');

  const filteredInvestors = investors.filter(inv => {
    if (filter === 'all') return true;
    return inv.introPath === filter;
  });

  const getIntroPathColor = (path: string) => {
    switch (path) {
      case 'warm': return 'bg-green-100 text-green-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      case 'apply': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'warm', label: 'Warm intro' },
          { key: 'cold', label: 'Cold' },
          { key: 'apply', label: 'Apply' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Why They Fit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intro Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  How to Approach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvestors.map((investor, index) => {
                const originalIndex = investors.indexOf(investor);
                const isExpanded = expandedRow === originalIndex;

                return (
                  <>
                    <tr
                      key={originalIndex}
                      onClick={() => setExpandedRow(isExpanded ? null : originalIndex)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{investor.name}</div>
                        <div className="text-sm text-gray-500">{investor.fund}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{investor.checkSize}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        {investor.whyFit}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getIntroPathColor(investor.introPath)}`}>
                          {investor.introPath}
                        </span>
                        {investor.mutual && (
                          <div className="text-xs text-gray-500 mt-1">{investor.mutual}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        {investor.approach}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={investor.status || 'Not contacted'}
                          onChange={(e) => onUpdateStatus(originalIndex, e.target.value)}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${originalIndex}-expanded`}>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {investor.redFlag && (
                              <div>
                                <h4 className="text-sm font-medium text-red-700 mb-1">Red Flag</h4>
                                <p className="text-sm text-gray-700">{investor.redFlag}</p>
                              </div>
                            )}

                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-1">Cold Message</h4>
                              <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                                {investor.coldMessage}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Signals</h4>
                              <ul className="space-y-1">
                                {investor.signals.map((signal, i) => (
                                  <li key={i} className="text-sm text-gray-700 flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <span>{signal}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvestors.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No investors match this filter
          </div>
        )}
      </div>
    </div>
  );
}
