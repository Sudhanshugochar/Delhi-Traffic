'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Lock, Database } from 'lucide-react';
import { Badge } from '@/components/common/Button';
import { ErrorComponent, EmptyState } from '@/components/common/ErrorComponent';
import { CardSkeleton, TableSkeleton } from '@/components/common/Skeletons';
import { formatDate, formatTimeAgo } from '@/utils/helpers';
import { loadJsonData, getCachedData, setCachedData } from '@/utils/cache';
import clsx from 'clsx';

interface CodeSigningKey {
  id: string;
  keyAlias: string;
  algorithm: string;
  protectionLevel: 'HSM' | 'Software';
  createdAt: string;
  lastUsed: string;
  hsmModule: string | null;
  certificateThumbprint: string;
}

export const CodeSigningKeysModule: React.FC = () => {
  const [keys, setKeys] = useState<CodeSigningKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'used'>('created');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = getCachedData<CodeSigningKey[]>('code-signing-keys');
        if (cached) {
          setKeys(cached as CodeSigningKey[]);
          setLoading(false);
        }

        const data = await loadJsonData<CodeSigningKey[]>('code-signing-keys.json');
        setKeys(data as CodeSigningKey[]);
        setCachedData('code-signing-keys', data as CodeSigningKey[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load code signing keys');
        const cached = getCachedData<CodeSigningKey[]>('code-signing-keys');
        if (cached) {
          setKeys(cached as CodeSigningKey[]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sort
  const sorted = useMemo(() => {
    const result = [...keys];
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.keyAlias.localeCompare(b.keyAlias);
      } else if (sortBy === 'created') {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
        );
      }
    });
    return result;
  }, [keys, sortBy]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    const loadData = async () => {
      try {
        const data = await loadJsonData<CodeSigningKey[]>('code-signing-keys.json');
        setKeys(data as CodeSigningKey[]);
        setCachedData('code-signing-keys', data as CodeSigningKey[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load code signing keys');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (error && keys.length === 0) {
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
          Code Signing Keys
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage code signing and artifact signing keys
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'created' | 'used')}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created">Sort by Created Date</option>
          <option value="used">Sort by Last Used</option>
          <option value="name">Sort by Name</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'px-4 py-2 rounded-lg border transition-colors',
              viewMode === 'grid'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={clsx(
              'px-4 py-2 rounded-lg border transition-colors',
              viewMode === 'table'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && keys.length === 0 ? (
        viewMode === 'grid' ? (
          <CardSkeleton count={6} />
        ) : (
          <TableSkeleton count={5} />
        )
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No code signing keys found"
          message="No keys available"
          className="p-12 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((key) => (
            <div
              key={key.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow"
            >
              {/* Icon */}
              <div className="mb-4">
                {key.protectionLevel === 'HSM' ? (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
                    <Lock className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                    <Database className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {key.keyAlias}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {key.algorithm}
              </p>

              {/* Badge */}
              <div className="mb-4">
                <Badge
                  variant={key.protectionLevel === 'HSM' ? 'success' : 'info'}
                >
                  {key.protectionLevel}
                </Badge>
              </div>

              {/* Meta */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {formatDate(key.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Last Used:</span>{' '}
                  {formatTimeAgo(key.lastUsed)}
                </div>
                {key.hsmModule && (
                  <div>
                    <span className="font-medium">HSM:</span> {key.hsmModule}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Key Alias
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Algorithm
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Protection Level
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Last Used
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sorted.map((key) => (
                <tr
                  key={key.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {key.keyAlias}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {key.algorithm}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge
                      variant={
                        key.protectionLevel === 'HSM' ? 'success' : 'info'
                      }
                    >
                      {key.protectionLevel}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(key.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatTimeAgo(key.lastUsed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
