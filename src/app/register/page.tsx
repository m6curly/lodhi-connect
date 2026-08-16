'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput } from '@/components/PasswordInput';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const block = String(form.get('block') || '');
    const house_number = String(form.get('house_number') || '').trim();
    const password = String(form.get('password') || '');
    const confirm_password = String(
      form.get('confirm_password') || ''
    );

    if (password !== confirm_password) {
      setError('Password and Confirm Password do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            block,
            house_number,
            role: 'resident',
          },
        },
      });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError('Account could not be created.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        name,
        email,
        phone,
        block,
        house_number,
        role: 'resident',
      });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setSuccess(
        'Account created! Please verify your email, then sign in.'
      );
      setLoading(false);
      return;
    }

    window.location.href = '/resident';
  }

  return (
    <main className="container py-10 md:py-16">
      <div className="max-w-lg mx-auto card p-7 md:p-9">

        <div className="kicker">
          Resident registration
        </div>

        <h1 className="serif text-4xl mt-2">
          Create your account.
        </h1>

        <p className="muted mt-2">
          Register your C2 / D1 resident account.
        </p>

        <form
          onSubmit={submit}
          className="space-y-5 mt-7"
        >

          <div>
            <label className="label">
              Full Name
            </label>

            <input
              className="input"
              name="name"
              type="text"
              required
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="label">
              Gmail / Email
            </label>

            <input
              className="input"
              name="email"
              type="email"
              required
              placeholder="you@gmail.com"
            />
          </div>

          <div>
            <label className="label">
              Phone Number
            </label>

            <input
              className="input"
              name="phone"
              type="tel"
              required
              placeholder="Your mobile number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="label">
                Block
              </label>

              <select
                className="input"
                name="block"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select block
                </option>

                <option value="C2">
                  C2
                </option>

                <option value="D1">
                  D1
                </option>
              </select>
            </div>

            <div>
              <label className="label">
                House Number
              </label>

              <input
                className="input"
                name="house_number"
                type="text"
                required
                placeholder="House no."
              />
            </div>

          </div>

          <div>
            <label className="label">
              Password
            </label>

            <PasswordInput
              name="password"
            />
          </div>

          <div>
            <label className="label">
              Confirm Password
            </label>

            <PasswordInput
              name="confirm_password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-800 bg-green-50 p-3 rounded-xl">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-action w-full"
          >
            <UserPlus size={17} />

            <span>
              {loading
                ? 'Creating account...'
                : 'Create Resident Account'}
            </span>

            {!loading && (
              <ArrowRight size={16} />
            )}
          </button>

        </form>

        <div className="mt-6 text-center">
          <span className="muted text-sm">
            Already registered?{' '}
          </span>

          <Link
            href="/login"
            className="font-bold underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>

      </div>
    </main>
  );
}