'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon, MailSend01Icon, RefreshIcon } from '@hugeicons/core-free-icons';

const CONTACT_RESET_SECONDS = 12;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resetCountdown, setResetCountdown] = useState(CONTACT_RESET_SECONDS);

  const resetToForm = () => {
    setSubmitted(false);
    setError('');
    setResetCountdown(CONTACT_RESET_SECONDS);
  };

  useEffect(() => {
    if (!submitted) {
      return;
    }

    const interval = window.setInterval(() => {
      setResetCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          setSubmitted(false);
          return CONTACT_RESET_SECONDS;
        }

        return value - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [submitted]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          sourcePage: '/contact',
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? 'Unable to send message right now.');
        return;
      }

      setResetCountdown(CONTACT_RESET_SECONDS);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setError('Unable to send message right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="converter-main-card-blue rounded-3xl p-10 sm:p-12 text-center max-w-4xl mx-auto min-h-[23rem] flex flex-col justify-center">
        <div className="w-14 h-14 rounded-2xl icon-box-mint flex items-center justify-center mx-auto mb-5">
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            size={24}
            strokeWidth={1.5}
            className="text-emerald-500"
          />
        </div>
        <h2 className="text-sm font-semibold text-foreground mb-1">Message Sent</h2>
        <p className="text-xs text-muted-foreground">We&apos;ll get back to you soon.</p>
        <p className="text-xs text-muted-foreground mt-2">
          Returning to form in {resetCountdown}s.
        </p>
        <button
          type="button"
          onClick={resetToForm}
          className="mt-5 inline-flex items-center justify-center gap-2 bg-white/70 border border-blue-100/60 text-blue-700 rounded-xl px-5 py-2.5 font-medium text-sm hover:bg-white/90 transition-colors mx-auto"
        >
          <HugeiconsIcon icon={RefreshIcon} size={14} strokeWidth={2} />
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="converter-main-card-blue rounded-3xl p-8 sm:p-10 space-y-6 max-w-4xl mx-auto min-h-[30rem]"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full bg-white/70 border border-blue-100/60 rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-200/70"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
          Business Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full bg-white/70 border border-blue-100/60 rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-200/70"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={8}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full min-h-[14rem] bg-white/70 border border-blue-100/60 rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-200/70 resize-none"
          placeholder="How can we help?"
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl px-4 py-3 font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
      >
        <HugeiconsIcon icon={MailSend01Icon} size={16} strokeWidth={2} />
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
