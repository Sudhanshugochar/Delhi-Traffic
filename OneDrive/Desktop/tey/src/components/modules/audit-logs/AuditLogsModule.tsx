'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/common/Button';
import { ErrorComponent, EmptyState } from '@/components/common/ErrorComponent';
import { TableSkeleton } from '@/components/common/Skeletons';
import { formatDateTime, formatTimeAgo } from '@/utils/helpers';
import { loadJsonData, getCachedData, setCachedData } from '@/utils/cache';
import clsx from 'clsx';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actionType: string;
  targetResource: string;
  resourceName: string;
  status: 'success' | 'failed' | 'warning';
  metadata: Record<string, unknown>;
}

export const AuditLogsModule: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionFilter, setActionFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start: string;
    end: string;
  }>({ start: '', end: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(10);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = getCachedData<AuditLog[]>('audit-logs');
        if (cached) {
          setLogs(cached as AuditLog[]);
          setLoading(false);
        }

        const data = await loadJsonData<AuditLog[]>('audit-logs.json');
        setLogs(data as AuditLog[]);
        setCachedData('audit-logs', data as AuditLog[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit logs');
        const cached = getCachedData<AuditLog[]>('audit-logs');
        if (cached) {
          setLogs(cached as AuditLog[]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get unique action types
  const actionTypes = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.actionType))).sort();
  }, [logs]);

  // Filter
  const filtered = useMemo(() => {
    let result = logs;

    if (actionFilter) {
      result = result.filter((log) => log.actionType === actionFilter);
    }

    if (dateRangeFilter.start) {
      result = result.filter(
        (log) => new Date(log.timestamp) >= new Date(dateRangeFilter.start)
      );
    }

    if (dateRangeFilter.end) {
      result = result.filter(
        (log) => new Date(log.timestamp) <= new Date(dateRangeFilter.end)
      );
    }

    // Sort by timestamp descending
    return result.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [logs, actionFilter, dateRangeFilter]);

  // Infinite scroll
  const displayedLogs = useMemo(
    () => filtered.slice(0, displayCount),
    [filtered, displayCount]
  );

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500
      ) {
        setDisplayCount((prev) => Math.min(prev + 10, filtered.length));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filtered.length]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    const loadData = async () => {
      try {
        const data = await loadJsonData<AuditLog[]>('audit-logs.json');
        setLogs(data as AuditLog[]);
        setCachedData('audit-logs', data as AuditLog[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    const statusMap = {
      success: 'success' as const,
      failed: 'danger' as const,
      warning: 'warning' as const,
    };
    return statusMap[status as keyof typeof statusMap] || 'default';
  };

  if (error && logs.length === 0) {
    return (
      <ErrorComponent
        message={error}
        onRetry={handleRetry}
        className="m-6"
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Audit Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all system actions and events
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Action Type
          </label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setDisplayCount(10);
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={dateRangeFilter.start}
            onChange={(e) => {
              setDateRangeFilter({ ...dateRangeFilter, start: e.target.value });
              setDisplayCount(10);
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={dateRangeFilter.end}
            onChange={(e) => {
              setDateRangeFilter({ ...dateRangeFilter, end: e.target.value });
              setDisplayCount(10);
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Logs */}
      {loading && logs.length === 0 ? (
        <TableSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          message="Try adjusting your filters"
          className="p-12 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      ) : (
        <div className="space-y-3">
          {displayedLogs.map((log) => (
            <div
              key={log.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Main Row */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === log.id ? null : log.id)
                }
                className="w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.actionType.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {log.resourceName} • by {log.actor}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatTimeAgo(log.timestamp)}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        {expandedId === log.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Row */}
              {expandedId === log.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 animate-expand-collapse">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Timestamp
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {formatDateTime(log.timestamp)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Actor
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {log.actor}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Target Resource
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {log.targetResource}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Status
                        </label>
                        <Badge variant={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata */}
                    {Object.keys(log.metadata).length > 0 && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                          Metadata
                        </label>
                        <pre className="bg-white dark:bg-gray-700 p-3 rounded-lg text-xs text-gray-900 dark:text-white overflow-auto max-h-48">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Load More Indicator */}
          {displayCount < filtered.length && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {displayCount} of {filtered.length} logs • Scroll to load more
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
