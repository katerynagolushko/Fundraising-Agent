'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/UploadZone';
import LinkedInInputs from '@/components/LinkedInInputs';
import { colors } from '@/design-tokens';

export default function UploadPage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [linkedinUrls, setLinkedinUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('linkedinUrls', JSON.stringify(linkedinUrls.filter(url => url.trim())));

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Extraction failed');
      }

      const data = await response.json();
      localStorage.setItem('extractedProfile', JSON.stringify(data));
      router.push('/review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: colors.background }}>
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-2">
          <h1 className="text-2xl font-semibold" style={{ color: colors.text }}>
            RAISE
          </h1>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.red }} />
        </div>

        <div className="rounded-xl border p-8 space-y-6" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
          <h2 className="text-xl font-medium" style={{ color: colors.text }}>
            Upload your pitch deck
          </h2>

          <UploadZone onUpload={setUploadedFile} uploadedFile={uploadedFile} />

          <LinkedInInputs linkedinUrls={linkedinUrls} onChange={setLinkedinUrls} />

          {error && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.redLight + '20', borderLeft: `3px solid ${colors.red}` }}>
              <p className="text-sm" style={{ color: colors.red }}>{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => router.push('/manual')}
              className="text-sm font-medium hover:underline"
              style={{ color: colors.textMuted }}
            >
              Fill in manually instead
            </button>

            <button
              onClick={handleExtract}
              disabled={!uploadedFile || loading}
              className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: uploadedFile && !loading ? colors.gold : colors.gray300,
                color: colors.white,
              }}
            >
              {loading ? 'Extracting...' : 'Extract info'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
