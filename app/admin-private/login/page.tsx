import { notFound, redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin-login-form';
import { AdminBrandHeader } from '@/components/admin-brand-header';
import {
  getAdminInboxPathOrFallback,
  getCurrentAdminUser,
  isAdminFeatureConfigured,
} from '@/lib/admin-auth';
import type { Metadata } from 'next';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPrivateLoginPage() {
  if (!isAdminFeatureConfigured()) {
    notFound();
  }

  const inboxPath = getAdminInboxPathOrFallback();
  const currentAdmin = await getCurrentAdminUser();
  if (currentAdmin) {
    redirect(inboxPath);
  }

  return (
    <div className="min-h-screen bg-dot-grid-subtle px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminBrandHeader inboxPath={inboxPath} identityLabel="Not signed in" />

        <div className="w-full max-w-xl mx-auto pt-4 sm:pt-8">
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2">
              Admin Access
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your authorized admin account.
            </p>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
