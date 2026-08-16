'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogIn, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Brand } from './Brand';

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = createClient();

    s.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = s.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="container h-[72px] flex items-center justify-between">
        <Brand />

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
          <Link className="nav-link" href="/#dashboard">
            Dashboard
          </Link>

          <Link className="nav-link" href="/#complaints">
            Complaints
          </Link>

          <Link className="nav-link" href="/#updates">
            Updates
          </Link>

          <Link className="nav-link" href="/#gallery">
            Gallery
          </Link>
        </nav>

        {/* Desktop login / portal */}
        <div className="hidden md:block">
          {user ? (
            <Link className="btn btn-primary btn-action" href="/resident">
              <span>My Portal</span>
            </Link>
          ) : (
            <Link className="btn btn-primary btn-action" href="/login">
              <LogIn size={16} />
              <span>Resident Login</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {open && (
        <div className="md:hidden border-t border-[#e5e0d5] p-4 space-y-2">
          <Link
            className="mobile-nav-link"
            href="/#dashboard"
            onClick={closeMenu}
          >
            Dashboard
          </Link>

          <Link
            className="mobile-nav-link"
            href="/#complaints"
            onClick={closeMenu}
          >
            Complaints
          </Link>

          <Link
            className="mobile-nav-link"
            href="/#updates"
            onClick={closeMenu}
          >
            Updates
          </Link>

          <Link
            className="mobile-nav-link"
            href="/#gallery"
            onClick={closeMenu}
          >
            Gallery
          </Link>

          {user ? (
            <Link
              className="mobile-nav-link mobile-nav-primary"
              href="/resident"
              onClick={closeMenu}
            >
              My Portal →
            </Link>
          ) : (
            <Link
              className="mobile-nav-link mobile-nav-primary"
              href="/login"
              onClick={closeMenu}
            >
              <LogIn size={17} />
              Resident Login →
            </Link>
          )}
        </div>
      )}
    </header>
  );
}