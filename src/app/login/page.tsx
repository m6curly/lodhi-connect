'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/PasswordInput';

export default function Login() {
  const r = useRouter();
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    const f = new FormData(e.currentTarget);
    const s = createClient();

    const { error } = await s.auth.signInWithPassword({
      email: String(f.get('email')),
      password: String(f.get('password')),
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    const {
      data: { user },
    } = await s.auth.getUser();

    const { data } = await s
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single();

    r.push(data?.role === 'admin' ? '/admin' : '/resident');
    r.refresh();
  }

  return (
    <main className="container py-16 md:py-24">
      <div className="max-w-md mx-auto card p-7 md:p-9">

        <div className="kicker">Resident portal</div>

        <h1 className="serif text-4xl mt-2">
          Welcome back.
        </h1>

        <p className="muted mt-2">
          Use your registered email and password.
        </p>

        <form onSubmit={submit} className="space-y-5 mt-7">

          <div>
            <label className="label">Gmail / Email</label>
            <input
              className="input"
              name="email"
              type="email"
              required
              placeholder="you@gmail.com"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <PasswordInput name="password" />
          </div>

          {err && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">
              {err}
            </div>
          )}

          <button
            className="btn btn-primary btn-action w-full"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Signing in…' : 'Sign in'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* CREATE ACCOUNT */}
        <div className="mt-6">
          <Link
            href="/register"
            className="btn btn-light btn-action w-full"
          >
            <UserPlus size={17} />
            <span>Create Resident Account</span>
          </Link>
        </div>

        {/* FORGOT PASSWORD */}
        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm font-bold underline underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-7 pt-5 border-t border-[#e5e0d5] text-xs muted flex gap-2">
          <LockKeyhole size={14} />
          <span>
            Admin login uses the same page; role is controlled in Supabase.
          </span>
        </div>

      </div>
    </main>
  );
}