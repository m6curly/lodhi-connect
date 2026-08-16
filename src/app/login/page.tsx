'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  LockKeyhole,
  UserPlus,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/PasswordInput';

export default function Login() {
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    const supabase = createClient();

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Login failed. Please try again.');
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError) {
      setError(
        'Login successful, but your resident profile could not be found.'
      );
      setLoading(false);
      return;
    }

    if (profile?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/resident');
    }

    router.refresh();
  }

  return (
    <main className="container py-12 md:py-20">
      <div className="max-w-md mx-auto card p-7 md:p-9">

        {/* HEADER */}
        <div className="kicker">
          Resident portal
        </div>

        <h1 className="serif text-4xl mt-2">
          Welcome back.
        </h1>

        <p className="muted mt-2">
          Use your registered email and password.
        </p>

        {/* LOGIN FORM */}
        <form
          onSubmit={submit}
          className="space-y-5 mt-7"
        >

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="label"
            >
              Gmail / Email
            </label>

            <input
              id="email"
              className="input"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@gmail.com"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="label"
            >
              Password
            </label>

            <PasswordInput
              name="password"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* SIGN IN */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-action w-full"
          >
            <span>
              {loading ? 'Signing in...' : 'Sign in'}
            </span>

            {!loading && (
              <ArrowRight size={16} />
            )}
          </button>

        </form>

        {/* CREATE ACCOUNT */}
        <div className="mt-6">

          <Link
            href="/register"
            className="btn btn-light btn-action w-full"
          >
            <UserPlus size={18} />

            <span>
              Create Resident Account
            </span>

            <ArrowRight
              size={16}
              className="ml-auto"
            />
          </Link>

        </div>

        {/* FORGOT PASSWORD */}
        <div className="text-center mt-4">

          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center min-h-[44px] px-3 font-bold underline underline-offset-4"
          >
            Forgot password?
          </Link>

        </div>

        {/* INFO */}
        <div className="mt-7 pt-5 border-t border-[#e5e0d5] text-xs muted flex gap-2">
          <LockKeyhole
            size={14}
            className="shrink-0 mt-0.5"
          />

          <span>
            Admin login uses the same page. Your account
            role is controlled in Supabase.
          </span>
        </div>

      </div>
    </main>
  );
}