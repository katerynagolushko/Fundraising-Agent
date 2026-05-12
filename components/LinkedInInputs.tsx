'use client';

import { useState } from 'react';
import { colors } from '@/design-tokens';

type Props = {
  linkedinUrls: string[];
  onChange: (urls: string[]) => void;
};

export default function LinkedInInputs({ linkedinUrls, onChange }: Props) {
  const [showCofounder, setShowCofounder] = useState(linkedinUrls.length > 1);

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...linkedinUrls];
    newUrls[index] = value;
    onChange(newUrls);
  };

  const addCofounder = () => {
    onChange([...linkedinUrls, '']);
    setShowCofounder(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs uppercase font-medium mb-2" style={{ color: colors.textMuted }}>
          Founder LinkedIn
        </label>
        <input
          type="url"
          value={linkedinUrls[0] || ''}
          onChange={(e) => handleUrlChange(0, e.target.value)}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.white,
            color: colors.text,
          }}
        />
      </div>

      {showCofounder && (
        <div>
          <label className="block text-xs uppercase font-medium mb-2" style={{ color: colors.textMuted }}>
            Co-founder LinkedIn
          </label>
          <input
            type="url"
            value={linkedinUrls[1] || ''}
            onChange={(e) => handleUrlChange(1, e.target.value)}
            placeholder="https://linkedin.com/in/cofounder"
            className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.white,
              color: colors.text,
            }}
          />
        </div>
      )}

      {!showCofounder && (
        <button
          type="button"
          onClick={addCofounder}
          className="text-sm font-medium hover:underline"
          style={{ color: colors.gold }}
        >
          + Add co-founder
        </button>
      )}
    </div>
  );
}
