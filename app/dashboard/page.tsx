'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { colors } from '@/design-tokens';
import { supabase } from '@/lib/supabase';

type SavedSearch = {
  id: string;
  sector: string;
  stage: string;
  created_at: string;
  investor_count: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      loadSearches();
    }
  }, [status, session, router]);

  const loadSearches = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          sector,
          stage,
          created_at,
          investors:investors(count)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSearches(
        profiles?.map((p: any) => ({
          id: p.id,
          sector: p.sector,
          stage: p.stage,
          created_at: p.created_at,
          investor_count: p.investors[0]?.count || 0,
        })) || []
      );
    } catch (error) {
      console.error('Failed to load searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSearch = (searchId: string) => {
    localStorage.setItem('currentProfileId', searchId);
    router.push('/table');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <p style={{ color: colors.textMuted }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold" style={{ color: colors.text }}>RAISE</h1>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.red }} />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: colors.textMuted }}>
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 text-sm font-medium rounded-lg border transition-all"
              style={{
                borderColor: colors.border,
                color: colors.textMuted,
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-medium" style={{ color: colors.text }}>
            Your Searches
          </h2>
          <button
            onClick={() => router.push('/upload')}
            className="px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: colors.gold,
              color: colors.white,
            }}
          >
            + New Search
          </button>
        </div>

        {searches.length === 0 ? (
          <div className="text-center py-16 rounded-xl border" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
            <p className="mb-4" style={{ color: colors.textMuted }}>
              No saved searches yet
            </p>
            <button
              onClick={() => router.push('/upload')}
              className="px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: colors.gold,
                color: colors.white,
              }}
            >
              Create your first search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searches.map((search) => (
              <button
                key={search.id}
                onClick={() => loadSearch(search.id)}
                className="p-6 rounded-xl border text-left transition-all hover:border-opacity-100"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                }}
              >
                <div className="mb-3">
                  <h3 className="font-medium mb-1" style={{ color: colors.text }}>
                    {search.sector}
                  </h3>
                  <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: colors.goldLight + '40', color: colors.goldDark }}>
                    {search.stage}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                  <span className="text-sm" style={{ color: colors.textMuted }}>
                    {search.investor_count} investors
                  </span>
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    {new Date(search.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
