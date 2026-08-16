'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, LogOut, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/StatusBadge';

export default function Resident() {
  const r = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const s = createClient();
    const {
      data: { user },
    } = await s.auth.getUser();

    if (!user) {
      r.push('/login');
      return;
    }

    const { data: p } = await s
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (p?.role === 'admin') {
      r.push('/admin');
      return;
    }

    setProfile(p);

    const { data } = await s
      .from('complaints')
      .select('*')
      .eq('resident_id', user.id)
      .order('created_at', { ascending: false });

    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function logout() {
    const s = createClient();
    await s.auth.signOut();
    r.push('/');
    r.refresh();
  }

  if (loading) {
    return <main className="container py-20">Loading portal...</main>;
  }

  return (
    <main className="container py-10 md:py-14">
      <div className="flex flex-col md:flex-row justify-between gap-5">
        <div>
          <div className="kicker">Resident portal</div>

          <h1 className="serif text-4xl mt-1">
            Namaste, {profile?.name?.split(' ')[0]}.
          </h1>

          <p className="muted mt-2">
            {profile?.block} · House {profile?.house_number} · {profile?.phone}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            className="btn btn-primary btn-action"
            href="/resident/new"
          >
            <Plus size={17} />
            <span>New complaint</span>
          </Link>

          <button
            className="btn btn-light btn-action"
            onClick={logout}
            type="button"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Stat label="Total" value={items.length} />

        <Stat
          label="Open"
          value={
            items.filter(
              (x) => !['resolved', 'closed'].includes(x.status)
            ).length
          }
        />

        <Stat
          label="Resolved"
          value={
            items.filter(
              (x) => ['resolved', 'closed'].includes(x.status)
            ).length
          }
        />
      </div>

      <div className="flex items-center justify-between mt-10">
        <h2 className="text-xl font-bold">My complaints</h2>

        <button
          className="btn btn-light btn-action text-sm"
          onClick={load}
          type="button"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-3 mt-4">
        {items.length ? (
          items.map((x) => (
            <Link
              href={`/resident/complaint/${x.id}`}
              key={x.id}
              className="card complaint-link p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="text-xs muted font-bold">
                  {x.complaint_number} ·{' '}
                  {new Date(x.created_at).toLocaleString('en-IN')}
                </div>

                <div className="font-bold mt-1">{x.title}</div>

                <div className="text-sm muted mt-1">
                  {x.category} · {x.block} · House {x.house_number}
                </div>

                <div className="click-hint mt-3">
                  Tap to view complaint →
                </div>
              </div>

              <StatusBadge status={x.status} />
            </Link>
          ))
        ) : (
          <div className="card p-8 text-center">
            <Search className="mx-auto muted" />

            <div className="font-bold mt-3">No complaints yet</div>

            <p className="muted text-sm mt-1">
              Raise your first complaint from the button above.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="card p-5">
      <div className="text-3xl font-bold">{value}</div>
      <div className="muted text-sm">{label}</div>
    </div>
  );
}