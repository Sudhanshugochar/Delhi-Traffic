'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TrustLevelBadge } from '@/components/common/Button';
import { ErrorComponent, EmptyState } from '@/components/common/ErrorComponent';
import { TableSkeleton } from '@/components/common/Skeletons';
import { formatTimeAgo } from '@/utils/helpers';
import { loadJsonData, getCachedData, setCachedData, clearCache } from '@/utils/cache';
import { debounce } from '@/utils/helpers';
import clsx from 'clsx';

interface Server {
  name: string;
  ip: string;
}

interface SSHKey {
  id: string;
  keyOwner: string;
  fingerprint: string;
  lastUsed: string;
  trustLevel: 'High' | 'Medium' | 'Low';
  createdAt: string;
  algorithm: string;
  keyLength: number;
  servers: Server[];
}

export const SSHKeysModule: React.FC = () => {
  const [keys, setKeys] = useState<SSHKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'trust' | 'owner' | 'recent'>('trust');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = getCachedData<SSHKey[]>('ssh-keys');
        if (cached) {
          setKeys(cached);
          setLoading(false);
        }

        const data = await loadJsonData<SSHKey[]>('ssh-keys.json');
        setKeys(data as SSHKey[]);
        setCachedData('ssh-keys', data as SSHKey[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load SSH keys');
        const cached = getCachedData<SSHKey[]>('ssh-keys');
        if (cached) {
          setKeys(cached);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort with debounced search
  const filtered = useMemo(() => {
    const result = keys.filter(
      (key) =>
        searchTerm === '' ||
        key.keyOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.fingerprint.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === 'trust') {
        const trustOrder = { High: 0, Medium: 1, Low: 2 };
        return trustOrder[a.trustLevel] - trustOrder[b.trustLevel];
      } else if (sortBy === 'owner') {
        return a.keyOwner.localeCompare(b.keyOwner);
      } else {
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      }
    });

    return result;
  }, [keys, searchTerm, sortBy]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    const loadData = async () => {
      try {
        const data = await loadJsonData<SSHKey[]>('ssh-keys.json');
        setKeys(data as SSHKey[]);
        setCachedData('ssh-keys', data as SSHKey[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load SSH keys');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SSH Keys</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage SSH authentication keys and server access
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by owner or fingerprint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'trust' | 'owner' | 'recent')}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="trust">Sort by Trust Level</option>
          <option value="owner">Sort by Owner</option>
          <option value="recent">Sort by Recent</option>
        </select>
      </div>

      {/* List */}
      {loading && keys.length === 0 ? (
        <TableSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No SSH keys found"
          message="Try adjusting your search"
          className="p-12 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((key) => (
            <div
              key={key.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Main Row */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === key.id ? null : key.id)
                }
                className="w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {key.keyOwner}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {key.fingerprint.substring(0, 40)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <TrustLevelBadge level={key.trustLevel} />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Last used: {formatTimeAgo(key.lastUsed)}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        {expandedId === key.id ? (
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
              {expandedId === key.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 animate-expand-collapse">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Algorithm
                      </label>
                      <p className="text-gray-900 dark:text-white">{key.algorithm}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Key Length
                      </label>
                      <p className="text-gray-900 dark:text-white">{key.keyLength} bits</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Created At
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Last Used
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(key.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Servers */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                      Associated Servers
                    </label>
                    <div className="space-y-2">
                      {key.servers.map((server, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {server.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                              {server.ip}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
