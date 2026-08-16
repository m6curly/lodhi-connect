'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { COMPLAINT_CATEGORIES } from '@/lib/config';

export default function NewComplaint() {
  const router = useRouter();

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setErr('');
    setBusy(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select('block,house_number')
          .eq('id', user.id)
          .single();

      if (profileError) {
        setErr(
          `Unable to load your resident profile: ${profileError.message}`,
        );
        return;
      }

      if (!profile) {
        setErr(
          'Your resident profile could not be found. Please contact the RWA administrator.',
        );
        return;
      }

      const category = String(
        formData.get('category') ?? '',
      ).trim();

      const title = String(
        formData.get('title') ?? '',
      ).trim();

      const description = String(
        formData.get('description') ?? '',
      ).trim();

      const priority = String(
        formData.get('priority') ?? 'normal',
      ).trim();

      if (!category || !title || !description) {
        setErr(
          'Please fill in all required complaint details.',
        );
        return;
      }

      const { data: complaint, error } =
        await supabase
          .from('complaints')
          .insert({
            resident_id: user.id,
            block: profile.block,
            house_number: profile.house_number,
            category,
            title,
            description,
            priority,
          })
          .select('id')
          .single();

      if (error) {
        setErr(error.message);
        return;
      }

      if (!complaint) {
        setErr(
          'Complaint was submitted but no complaint ID was returned.',
        );
        return;
      }

      router.push(
        `/resident/complaint/${complaint.id}`,
      );
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : 'Something went wrong while submitting the complaint.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container py-10 md:py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/resident"
          className="text-sm font-bold flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to portal
        </Link>

        <div className="card p-7 md:p-9 mt-5">
          <div className="kicker">
            Raise a complaint
          </div>

          <h1 className="serif text-4xl mt-2">
            Tell the RWA what needs attention.
          </h1>

          <form
            onSubmit={submit}
            className="space-y-5 mt-7"
          >
            <div>
              <label className="label">
                Complaint category
              </label>

              <select
                className="input"
                name="category"
                required
              >
                {COMPLAINT_CATEGORIES.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="label">
                Title
              </label>

              <input
                className="input"
                name="title"
                required
                maxLength={120}
                placeholder="e.g. Water leakage near staircase"
              />
            </div>

            <div>
              <label className="label">
                Description
              </label>

              <textarea
                className="input min-h-32"
                name="description"
                required
                placeholder="Please describe the issue clearly…"
              />
            </div>

            <div>
              <label className="label">
                Priority
              </label>

              <select
                className="input"
                name="priority"
                defaultValue="normal"
              >
                <option value="normal">
                  Normal
                </option>

                <option value="urgent">
                  Urgent
                </option>
              </select>
            </div>

            {err && (
              <div className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">
                {err}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={busy}
            >
              {busy
                ? 'Submitting…'
                : 'Submit complaint'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}