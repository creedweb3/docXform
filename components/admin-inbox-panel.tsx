'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  RefreshIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { AdminBrandHeader } from '@/components/admin-brand-header';

type SubmissionStatus = 'new' | 'read' | 'replied' | 'archived';

interface SubmissionListItem {
  id: string;
  created_at: string;
  name: string;
  email: string;
  status: SubmissionStatus;
  preview: string;
  source_page?: string | null;
}

interface SubmissionDetail extends SubmissionListItem {
  message: string;
  archived_at?: string | null;
  replied_at?: string | null;
  user_agent?: string | null;
}

interface InboxResponse {
  items: SubmissionListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const STATUS_OPTIONS: Array<{ value: 'all' | SubmissionStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusClass(status: SubmissionStatus) {
  if (status === 'new') return 'bg-blue-50 text-blue-700 border-blue-100';
  if (status === 'read') return 'bg-slate-50 text-slate-700 border-slate-100';
  if (status === 'replied') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  return 'bg-amber-50 text-amber-700 border-amber-100';
}

export function AdminInboxPanel({
  loginPath,
  inboxPath,
  converterMetricsPath,
  adminEmail,
}: {
  loginPath: string;
  inboxPath: string;
  converterMetricsPath: string;
  adminEmail: string;
}) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('all');
  const [page, setPage] = useState(1);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [listRefreshState, setListRefreshState] = useState<
    'idle' | 'spinning' | 'success'
  >('idle');
  const [items, setItems] = useState<SubmissionListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SubmissionDetail | null>(null);
  const [actionLoading, setActionLoading] = useState<SubmissionStatus | 'delete' | null>(
    null
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const fetchList = useCallback(async () => {
    setLoadingList(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(page),
        status: statusFilter,
      });

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/messages?${params.toString()}`, {
        cache: 'no-store',
      });

      if (response.status === 401) {
        window.location.href = loginPath;
        return false;
      }

      const payload = (await response.json()) as InboxResponse & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? 'Failed to load inbox.');
        return false;
      }

      setItems(payload.items ?? []);
      setPagination(payload.pagination ?? { page: 1, limit: 12, total: 0, totalPages: 1 });

      if (payload.items?.length) {
        const stillVisible = payload.items.some((item) => item.id === selectedId);
        if (!selectedId || !stillVisible) {
          setSelectedId(payload.items[0].id);
        }
      } else {
        setSelectedId(null);
        setSelectedDetail(null);
        setMobileDetailOpen(false);
      }
      return true;
    } catch {
      setError('Failed to load inbox.');
      return false;
    } finally {
      setLoadingList(false);
    }
  }, [loginPath, page, search, selectedId, statusFilter]);

  const handleListRefresh = useCallback(async () => {
    if (loadingList || listRefreshState === 'spinning') return;

    const startedAt = Date.now();
    setListRefreshState('spinning');
    const ok = await fetchList();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, 1000 - elapsed);
    if (remaining > 0) {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), remaining);
      });
    }

    if (!ok) {
      setListRefreshState('idle');
      return;
    }
    setListRefreshState('success');
  }, [fetchList, listRefreshState, loadingList]);

  const fetchDetail = useCallback(
    async (id: string) => {
      setLoadingDetail(true);
      setError('');
      try {
        const response = await fetch(`/api/admin/messages/${id}`, {
          cache: 'no-store',
        });

        if (response.status === 401) {
          window.location.href = loginPath;
          return;
        }

        const payload = (await response.json()) as {
          item?: SubmissionDetail;
          error?: string;
        };

        if (!response.ok || !payload.item) {
          setError(payload.error ?? 'Failed to load message.');
          return;
        }

        setSelectedDetail(payload.item);
      } catch {
        setError('Failed to load message.');
      } finally {
        setLoadingDetail(false);
      }
    },
    [loginPath]
  );

  const runAction = useCallback(
    async (action: SubmissionStatus | 'delete') => {
      if (!selectedId) return;

      setActionLoading(action);
      setError('');
      try {
        if (action === 'delete') {
          const response = await fetch(`/api/admin/messages/${selectedId}`, {
            method: 'DELETE',
          });

          if (response.status === 401) {
            window.location.href = loginPath;
            return;
          }

          if (!response.ok) {
            const payload = (await response.json()) as { error?: string };
            setError(payload.error ?? 'Failed to delete message.');
            return;
          }
        } else {
          const response = await fetch(`/api/admin/messages/${selectedId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: action }),
          });

          if (response.status === 401) {
            window.location.href = loginPath;
            return;
          }

          if (!response.ok) {
            const payload = (await response.json()) as { error?: string };
            setError(payload.error ?? 'Failed to update message.');
            return;
          }
        }

        await fetchList();
        if (selectedId && action !== 'delete') {
          await fetchDetail(selectedId);
        }
      } catch {
        setError('Action failed. Please retry.');
      } finally {
        setActionLoading(null);
      }
    },
    [fetchDetail, fetchList, loginPath, selectedId]
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      window.location.href = loginPath;
    }
  }, [loginPath]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchList();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fetchList]);

  useEffect(() => {
    if (!selectedId) return;

    const timeout = window.setTimeout(() => {
      void fetchDetail(selectedId);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fetchDetail, selectedId]);

  useEffect(() => {
    if (listRefreshState !== 'success') return;
    const timeout = window.setTimeout(() => {
      setListRefreshState('idle');
    }, 900);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [listRefreshState]);

  return (
    <div className="space-y-4">
      <AdminBrandHeader
        inboxPath={inboxPath}
        identityLabel={adminEmail}
        inboxActive
        converterMetricsPath={converterMetricsPath}
        showLogout
        onLogout={() => void handleLogout()}
      />

      <div className="converter-main-card-blue rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-foreground">Messages</p>
          {loadingList ? (
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              strokeWidth={2}
              className="animate-spin text-muted-foreground"
            />
          ) : null}
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_170px_auto] gap-2.5">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={15}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setPage(1);
                  setSearch(searchInput.trim());
                }
              }}
              placeholder="Search name or email"
              className="w-full bg-white/70 border border-blue-100/60 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-200/70"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'all' | SubmissionStatus);
              setPage(1);
            }}
            className="bg-white/70 border border-blue-100/60 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-200/70"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setPage(1);
              setSearch(searchInput.trim());
            }}
            className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl px-3 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[370px_minmax(0,1fr)] gap-4">
        <div
          className={`${mobileDetailOpen ? 'hidden lg:block' : 'block'} converter-main-card-blue rounded-2xl p-4 min-h-[34rem] flex flex-col`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-semibold text-foreground">Inbox List</p>
            <button
              type="button"
              onClick={() => void handleListRefresh()}
              disabled={loadingList || listRefreshState === 'spinning'}
              title="Refresh list"
              aria-label="Refresh list"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {listRefreshState === 'success' ? (
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  size={14}
                  strokeWidth={2}
                  className="text-emerald-600"
                />
              ) : (
                <HugeiconsIcon
                  icon={RefreshIcon}
                  size={14}
                  strokeWidth={2}
                  className={listRefreshState === 'spinning' ? 'animate-spin' : ''}
                />
              )}
            </button>
          </div>
          <div
            className={`flex-1 pr-0.5 ${
              items.length === 0
                ? 'flex items-center justify-center'
                : 'overflow-y-auto'
            }`}
          >
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center px-2 py-3">
                No submissions found.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      setMobileDetailOpen(true);
                    }}
                    className={`w-full text-left rounded-xl border px-3.5 py-3 transition-colors ${
                      item.id === selectedId
                        ? 'border-blue-200/80 bg-white/80'
                        : 'border-blue-100/60 bg-white/55 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{item.email}</p>
                      </div>
                      <span
                        className={`shrink-0 border rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground max-h-9 overflow-hidden">
                      {item.preview}
                    </p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground/90">
                      {formatDateTime(item.created_at)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={pagination.page <= 1}
                className="rounded-md border border-blue-100/70 px-2 py-1 disabled:opacity-40 bg-white/65"
              >
                Prev
              </button>
              <button
                onClick={() =>
                  setPage((value) => Math.min(pagination.totalPages, value + 1))
                }
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-md border border-blue-100/70 px-2 py-1 disabled:opacity-40 bg-white/65"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className={`${mobileDetailOpen ? 'block' : 'hidden lg:block'} converter-main-card-blue rounded-2xl p-5 min-h-[34rem]`}>
          {!selectedItem ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Select a message to view details.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button
                    onClick={() => setMobileDetailOpen(false)}
                    className="inline-flex lg:hidden items-center gap-1 text-xs text-muted-foreground mb-2"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={12} strokeWidth={2} />
                    Back to list
                  </button>
                  <h2 className="text-lg font-semibold text-foreground">{selectedItem.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedItem.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(selectedItem.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 border rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(
                    selectedItem.status
                  )}`}
                >
                  {selectedItem.status}
                </span>
              </div>

              <div className="rounded-xl border border-blue-100/60 bg-white/65 p-4">
                {loadingDetail ? (
                  <p className="text-sm text-muted-foreground">Loading message...</p>
                ) : (
                  <>
                    <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedDetail?.message ?? selectedItem.preview}
                    </p>
                    {selectedDetail?.source_page ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Source: {selectedDetail.source_page}
                      </p>
                    ) : null}
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => void runAction('read')}
                  disabled={actionLoading !== null}
                  className="text-xs rounded-lg border border-blue-100/70 bg-white/70 px-3 py-1.5 disabled:opacity-50"
                >
                  {actionLoading === 'read' ? 'Updating...' : 'Mark read'}
                </button>
                <button
                  onClick={() => void runAction('replied')}
                  disabled={actionLoading !== null}
                  className="text-xs rounded-lg border border-blue-100/70 bg-white/70 px-3 py-1.5 disabled:opacity-50"
                >
                  {actionLoading === 'replied' ? 'Updating...' : 'Mark replied'}
                </button>
                <button
                  onClick={() =>
                    void runAction(selectedItem.status === 'archived' ? 'read' : 'archived')
                  }
                  disabled={actionLoading !== null}
                  className="text-xs rounded-lg border border-blue-100/70 bg-white/70 px-3 py-1.5 disabled:opacity-50"
                >
                  {actionLoading === 'archived'
                    ? 'Updating...'
                    : selectedItem.status === 'archived'
                    ? 'Unarchive'
                    : 'Archive'}
                </button>
                <button
                  onClick={() => void runAction('delete')}
                  disabled={actionLoading !== null}
                  className="text-xs inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 disabled:opacity-50"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={2} />
                  {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
