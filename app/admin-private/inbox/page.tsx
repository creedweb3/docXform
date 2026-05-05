import { notFound, redirect } from 'next/navigation';
import { AdminInboxPanel } from '@/components/admin-inbox-panel';
import {
  getAdminInboxPathOrFallback,
  getAdminLoginPathOrFallback,
  getCurrentAdminUser,
  isAdminFeatureConfigured,
} from '@/lib/admin-auth';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPrivateInboxPage() {
  if (!isAdminFeatureConfigured()) {
    notFound();
  }

  const loginPath = getAdminLoginPathOrFallback();
  const inboxPath = getAdminInboxPathOrFallback();
  const currentAdmin = await getCurrentAdminUser();
  if (!currentAdmin) {
    redirect(loginPath);
  }

  return (
    <div className="min-h-screen bg-dot-grid-subtle px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <AdminInboxPanel
          loginPath={loginPath}
          inboxPath={inboxPath}
          adminEmail={currentAdmin.email}
        />
      </div>
    </div>
  );
}
