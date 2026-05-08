'use client';

import { FormEvent, useState } from 'react';
import { IconLockPassword, IconMail01 } from '@/components/icons';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? 'Unable to sign in.');
        return;
      }

      window.location.href = payload.redirectTo ?? '/';
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="converter-main-card-blue rounded-2xl p-7 sm:p-8 space-y-5">
      <div>
        <label
          htmlFor="admin-email"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Admin Email
        </label>
        <div className="relative">
          <IconMail01 size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full bg-white/70 border border-blue-100/60 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-200/70"
            placeholder="admin@yourdomain.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Password
        </label>
        <div className="relative">
          <IconLockPassword size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full bg-white/70 border border-blue-100/60 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-200/70"
            placeholder="********"
          />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
