'use client';

import { useState } from 'react';
import { colors } from '@/design-tokens';

type FieldProps = {
  label: string;
  value: string;
  confidence?: 'high' | 'medium' | 'low';
  onChange: (value: string) => void;
  multiline?: boolean;
};

function EditableField({ label, value, confidence, onChange, multiline }: FieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  const getConfidenceBadge = () => {
    if (!confidence) return null;

    const badges = {
      high: { text: 'high confidence', bg: colors.goldLight + '40', color: colors.goldDark },
      medium: { text: 'needs review', bg: colors.red + '20', color: colors.red },
      low: { text: 'not found — add manually', bg: 'transparent', color: colors.textMuted, border: '1px dashed' + colors.border },
    };

    const badge = badges[confidence];

    return (
      <span
        className="text-xs px-2 py-1 rounded"
        style={{
          backgroundColor: badge.bg,
          color: badge.color,
          border: badge.border,
        }}
      >
        {badge.text}
      </span>
    );
  };

  return (
    <div className="py-3 border-b last:border-0" style={{ borderColor: colors.border }}>
      <div className="flex items-start justify-between gap-4">
        <label className="text-xs uppercase font-medium min-w-[120px] pt-2" style={{ color: colors.textMuted }}>
          {label}
        </label>
        <div className="flex-1">
          {isEditing ? (
            multiline ? (
              <textarea
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                autoFocus
                rows={3}
                className="w-full px-3 py-2 border rounded resize-none focus:outline-none focus:ring-2"
                style={{ borderColor: colors.border, backgroundColor: colors.beigeLight }}
              />
            ) : (
              <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                autoFocus
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                style={{ borderColor: colors.border, backgroundColor: colors.beigeLight }}
              />
            )
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="cursor-pointer px-3 py-2 rounded hover:bg-opacity-50 transition-colors min-h-[40px]"
              style={{ backgroundColor: colors.beigeLight }}
            >
              <p style={{ color: colors.text }}>{value || 'Click to add'}</p>
            </div>
          )}
          {!isEditing && getConfidenceBadge()}
        </div>
      </div>
    </div>
  );
}

type Props = {
  title: string;
  fields: Array<{
    label: string;
    value: string;
    confidence?: 'high' | 'medium' | 'low';
    key: string;
    multiline?: boolean;
  }>;
  onUpdate: (key: string, value: string) => void;
};

export default function ReviewCard({ title, fields, onUpdate }: Props) {
  return (
    <div
      className="rounded-lg border-t-2 p-6"
      style={{
        borderTopColor: colors.gold,
        backgroundColor: colors.beige,
        borderLeft: `1px solid ${colors.border}`,
        borderRight: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <h3 className="text-sm uppercase font-semibold mb-4" style={{ color: colors.text }}>
        {title}
      </h3>
      <div>
        {fields.map((field) => (
          <EditableField
            key={field.key}
            label={field.label}
            value={field.value}
            confidence={field.confidence}
            onChange={(value) => onUpdate(field.key, value)}
            multiline={field.multiline}
          />
        ))}
      </div>
    </div>
  );
}
