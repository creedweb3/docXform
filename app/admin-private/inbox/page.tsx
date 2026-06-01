import { AdminInboxPanel } from '@/components/admin-inbox-panel';
import {
  getAdminConverterMetricsPathOrFallback,
  getAdminInboxPathOrFallback,
  getAdminLoginPathOrFallback,
} from '@/lib/admin-auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPrivateInboxPage() {
  const loginPath = getAdminLoginPathOrFallback();
  const inboxPath = getAdminInboxPathOrFallback();
  const converterMetricsPath = getAdminConverterMetricsPathOrFallback();

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <AdminInboxPanel
          loginPath={loginPath}
          inboxPath={inboxPath}
          converterMetricsPath={converterMetricsPath}
          adminEmail="Admin"
        />
      </div>
    </div>
  );
}
