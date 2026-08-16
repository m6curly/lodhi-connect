'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  ImagePlus,
  LogOut,
  RefreshCw,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/StatusBadge';

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

type Complaint = {
  id: string;
  complaint_number: string;
  created_at: string;
  title: string;
  category: string;
  block: string;
  house_number: string;
  assigned_staff_name: string | null;
  status: string;
  priority: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

type GalleryItem = {
  id: string;
  image_url: string;
  caption: string;
  event_date: string | null;
};

export default function Admin() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Complaint[]>([]);
  const [ann, setAnn] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || profileData?.role !== 'admin') {
      router.push('/resident');
      return;
    }

    setProfile(profileData);

    const [complaintsResult, announcementsResult, galleryResult] =
      await Promise.all([
        supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('gallery_items')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

    setItems(complaintsResult.data ?? []);
    setAnn(announcementsResult.data ?? []);
    setGallery(galleryResult.data ?? []);

    const errors = [
      complaintsResult.error,
      announcementsResult.error,
      galleryResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      setMsg(errors[0]?.message ?? 'Unable to load admin data.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function logout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push('/');
    router.refresh();
  }

  async function addAnnouncement(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get('title') ?? '').trim();
    const content = String(formData.get('content') ?? '').trim();

    if (!title || !content) {
      setMsg('Please enter announcement title and content.');
      return;
    }

    setBusy(true);
    setMsg('');

    const supabase = createClient();

    const { error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        is_published: true,
      });

    if (error) {
      setMsg(`Announcement error: ${error.message}`);
      setBusy(false);
      return;
    }

    setMsg('Announcement published successfully.');

    form.reset();

    await load();

    setBusy(false);
  }

  async function addGallery(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      setMsg('Please select an image.');
      return;
    }

    const caption = String(formData.get('caption') ?? '').trim();
    const eventDateValue = String(
      formData.get('event_date') ?? '',
    ).trim();

    if (!caption) {
      setMsg('Please enter a gallery caption.');
      return;
    }

    setBusy(true);
    setMsg('');

    const supabase = createClient();

    const safeName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '-',
    );

    const path = `${crypto.randomUUID()}-${safeName}`;

    const uploadResult = await supabase.storage
      .from('gallery')
      .upload(path, file, {
        upsert: false,
      });

    if (uploadResult.error) {
      setMsg(`Image upload error: ${uploadResult.error.message}`);
      setBusy(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(path);

    const { error: galleryError } = await supabase
      .from('gallery_items')
      .insert({
        image_url: publicUrlData.publicUrl,
        caption,
        event_date: eventDateValue || null,
      });

    if (galleryError) {
      setMsg(
        `Gallery database error: ${galleryError.message}`,
      );

      // Remove uploaded file if database insert failed.
      await supabase.storage
        .from('gallery')
        .remove([path]);

      setBusy(false);
      return;
    }

    setMsg('Gallery photo published successfully.');

    form.reset();

    await load();

    setBusy(false);
  }

  async function removeGallery(id: string) {
    const confirmed = window.confirm(
      'Delete this gallery item?',
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setMsg('');

    const supabase = createClient();

    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (error) {
      setMsg(`Delete error: ${error.message}`);
      setBusy(false);
      return;
    }

    setMsg('Gallery item deleted.');

    await load();

    setBusy(false);
  }

  return (
    <main className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="kicker">RWA administration</div>

          <h1 className="serif text-4xl mt-1">
            Control room.
          </h1>

          <p className="muted mt-2">
            Signed in as {profile?.name || 'Admin'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-light"
            onClick={load}
            disabled={busy}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={logout}
            disabled={busy}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {msg && (
        <div className="card p-4 mt-5 text-sm">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-7">
        <Metric
          label="Total"
          value={items.length}
        />

        <Metric
          label="Open"
          value={
            items.filter(
              (item) =>
                !['resolved', 'closed'].includes(
                  item.status,
                ),
            ).length
          }
        />

        <Metric
          label="Urgent"
          value={
            items.filter(
              (item) => item.priority === 'urgent',
            ).length
          }
        />

        <Metric
          label="Resolved"
          value={
            items.filter(
              (item) =>
                ['resolved', 'closed'].includes(
                  item.status,
                ),
            ).length
          }
        />

        <Metric
          label="Residents"
          value={0}
          icon={<Users size={18} />}
        />
      </div>

      <section className="mt-10">
        <h2 className="font-bold text-xl">
          Complaint work queue
        </h2>

        <div className="space-y-3 mt-4">
          {items.length === 0 && (
            <div className="card p-5 muted">
              No complaints yet.
            </div>
          )}

          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/complaint/${item.id}`}
              className="card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div>
                <div className="text-xs muted font-bold">
                  {item.complaint_number} ·{' '}
                  {new Date(
                    item.created_at,
                  ).toLocaleString('en-IN')}
                </div>

                <div className="font-bold mt-1">
                  {item.title}
                </div>

                <div className="text-sm muted">
                  {item.category} · {item.block} · House{' '}
                  {item.house_number}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm muted">
                  {item.assigned_staff_name ||
                    'Unassigned'}
                </span>

                <StatusBadge status={item.status} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 mt-12">
        <div className="card p-6">
          <div className="flex items-center gap-2 font-bold">
            <Bell size={18} />
            Publish announcement
          </div>

          <form
            onSubmit={addAnnouncement}
            className="space-y-4 mt-5"
          >
            <input
              className="input"
              name="title"
              required
              placeholder="Announcement title"
            />

            <textarea
              className="input min-h-28"
              name="content"
              required
              placeholder="Write the announcement…"
            />

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={busy}
            >
              <Send size={16} />

              {busy
                ? 'Publishing…'
                : 'Publish'}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {ann.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-[#f4f1e8] p-3 text-sm"
              >
                <b>{item.title}</b>

                <div className="muted mt-1">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 font-bold">
            <ImagePlus size={18} />
            Community gallery
          </div>

          <form
            onSubmit={addGallery}
            className="space-y-4 mt-5"
          >
            <input
              className="input"
              name="caption"
              required
              placeholder="Caption / event name"
            />

            <input
              className="input"
              name="event_date"
              type="date"
            />

            <input
              className="input"
              name="file"
              type="file"
              accept="image/*"
              required
            />

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={busy}
            >
              <ImagePlus size={16} />

              {busy
                ? 'Uploading…'
                : 'Publish photo'}
            </button>
          </form>

          <div className="grid grid-cols-3 gap-2 mt-5">
            {gallery.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="relative"
              >
                <img
                  src={item.image_url}
                  className="aspect-square object-cover rounded-xl"
                  alt={item.caption}
                />

                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-white/90 p-1"
                  onClick={() =>
                    removeGallery(item.id)
                  }
                  disabled={busy}
                  aria-label="Delete gallery item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex justify-between">
        <span className="muted text-xs">
          {label}
        </span>

        {icon}
      </div>

      <div className="text-2xl font-bold mt-2">
        {value}
      </div>
    </div>
  );
}