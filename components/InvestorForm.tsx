'use client';

import { useState } from 'react';

type Props = {
  onSubmit: (data: Record<string, string>) => void;
  loading: boolean;
  error: string;
};

export default function InvestorForm({ onSubmit, loading, error }: Props) {
  const [formData, setFormData] = useState({
    sector: '',
    problem: '',
    solution: '',
    stage: 'pre-seed',
    geography: '',
    businessModel: '',
    roundSize: '',
    teamBackground: '',
    traction: '',
    warmConnections: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
            Sector
          </label>
          <input
            type="text"
            id="sector"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., FinTech, HealthTech, AI"
          />
        </div>

        <div>
          <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
            Stage
          </label>
          <select
            id="stage"
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pre-seed">Pre-seed</option>
            <option value="seed">Seed</option>
          </select>
        </div>

        <div>
          <label htmlFor="geography" className="block text-sm font-medium text-gray-700 mb-2">
            Geography
          </label>
          <input
            type="text"
            id="geography"
            name="geography"
            value={formData.geography}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., SF Bay Area, NYC, Europe"
          />
        </div>

        <div>
          <label htmlFor="roundSize" className="block text-sm font-medium text-gray-700 mb-2">
            Round Size
          </label>
          <input
            type="text"
            id="roundSize"
            name="roundSize"
            value={formData.roundSize}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., $500K, $2M"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-2">
            Problem
          </label>
          <textarea
            id="problem"
            name="problem"
            value={formData.problem}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What problem are you solving?"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="solution" className="block text-sm font-medium text-gray-700 mb-2">
            Solution
          </label>
          <textarea
            id="solution"
            name="solution"
            value={formData.solution}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="How does your product solve this?"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="businessModel" className="block text-sm font-medium text-gray-700 mb-2">
            Business Model
          </label>
          <input
            type="text"
            id="businessModel"
            name="businessModel"
            value={formData.businessModel}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., SaaS, Marketplace, Transaction fees"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="teamBackground" className="block text-sm font-medium text-gray-700 mb-2">
            Team Background
          </label>
          <textarea
            id="teamBackground"
            name="teamBackground"
            value={formData.teamBackground}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Previous companies, expertise, relevant experience"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="traction" className="block text-sm font-medium text-gray-700 mb-2">
            Traction
          </label>
          <textarea
            id="traction"
            name="traction"
            value={formData.traction}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Revenue, users, growth metrics, partnerships"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="warmConnections" className="block text-sm font-medium text-gray-700 mb-2">
            Warm Connections
          </label>
          <textarea
            id="warmConnections"
            name="warmConnections"
            value={formData.warmConnections}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Names of VCs, angels, or advisors you know (optional)"
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? 'Finding Investors...' : 'Find Investors'}
      </button>
    </form>
  );
}
