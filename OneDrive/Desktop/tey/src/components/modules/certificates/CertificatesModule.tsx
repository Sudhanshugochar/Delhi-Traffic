'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Eye, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, StatusBadge } from '@/components/common/Button';
import { Modal, Drawer } from '@/components/common/Modal';
import { ErrorComponent, EmptyState } from '@/components/common/ErrorComponent';
import { TableSkeleton } from '@/components/common/Skeletons';
import { formatDate, getDaysUntilExpiry } from '@/utils/helpers';
import { loadJsonData, getCachedData, setCachedData } from '@/utils/cache';
import { useNotificationStore } from '@/context/store';
import clsx from 'clsx';

interface Certificate {
  id: string;
  name: string;
  domain: string;
  issuer: string;
  status: 'active' | 'expired' | 'expiring soon';
  expiryDate: string;
  issuedDate: string;
  subject: string;
  fingerprint: string;
}

export const CertificatesModule: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const [domainFilter, setDomainFilter] = useState('');
  const [sortBy, setSortBy] = useState<'expiry' | 'name'>('expiry');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [editedCert, setEditedCert] = useState<Certificate | null>(null);
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get cached data
        const cached = getCachedData<Certificate[]>('certificates');
        if (cached) {
          setCertificates(cached);
          setLoading(false);
        }

        // Load fresh data
        const data = await loadJsonData<Certificate[]>('certificates.json');
        setCertificates(data as Certificate[]);
        setCachedData('certificates', data as Certificate[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load certificates');
        // If loading failed, try to use cache
        const cached = getCachedData<Certificate[]>('certificates');
        if (cached) {
          setCertificates(cached);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort
  const filtered = useMemo(() => {
    const result = certificates.filter(
      (cert) =>
        domainFilter === '' ||
        cert.domain.toLowerCase().includes(domainFilter.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === 'expiry') {
        const daysA = getDaysUntilExpiry(a.expiryDate);
        const daysB = getDaysUntilExpiry(b.expiryDate);
        return daysA - daysB;
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [certificates, domainFilter, sortBy]);

  // Pagination
  const paginatedCerts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleViewCert = useCallback((cert: Certificate) => {
    setSelectedCert(cert);
    setViewModalOpen(true);
  }, []);

  const handleEditCert = useCallback((cert: Certificate) => {
    setEditedCert({ ...cert });
    setSelectedCert(cert);
    setEditDrawerOpen(true);
  }, []);

  const handleSaveCert = useCallback(() => {
    if (editedCert && selectedCert) {
      setCertificates((prev) =>
        prev.map((cert) => (cert.id === selectedCert.id ? editedCert : cert))
      );
      setEditDrawerOpen(false);
      addNotification({
        message: 'Certificate updated successfully',
        type: 'success',
        duration: 3000,
      });
    }
  }, [editedCert, selectedCert, addNotification]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    const loadData = async () => {
      try {
        const data = await loadJsonData<Certificate[]>('certificates.json');
        setCertificates(data as Certificate[]);
        setCachedData('certificates', data as Certificate[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (error && certificates.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Certificates</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and monitor SSL/TLS certificates
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Filter by domain..."
            value={domainFilter}
            onChange={(e) => {
              setDomainFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'expiry' | 'name')}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="expiry">Sort by Expiry</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Table */}
      {loading && certificates.length === 0 ? (
        <TableSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No certificates found"
          message="Try adjusting your filters"
          className="p-12 border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      ) : (
        <>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Certificate Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Issuer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedCerts.map((cert) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {cert.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {cert.domain}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {cert.issuer}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={cert.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(cert.expiryDate)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewCert(cert)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditCert(cert)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit certificate"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Certificate Details"
      >
        {selectedCert && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Name
              </label>
              <p className="text-gray-900 dark:text-white">{selectedCert.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Domain
                </label>
                <p className="text-gray-900 dark:text-white">{selectedCert.domain}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Issuer
                </label>
                <p className="text-gray-900 dark:text-white">{selectedCert.issuer}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Subject
              </label>
              <p className="text-gray-900 dark:text-white text-sm break-all">
                {selectedCert.subject}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Fingerprint
              </label>
              <p className="text-gray-900 dark:text-white text-sm break-all font-mono">
                {selectedCert.fingerprint}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Issued Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedCert.issuedDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Expiry Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedCert.expiryDate)}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </label>
              <div className="mt-1">
                <StatusBadge status={selectedCert.status} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Drawer */}
      <Drawer
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        title="Edit Certificate"
      >
        {editedCert && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Certificate Name
              </label>
              <input
                type="text"
                value={editedCert.name}
                onChange={(e) =>
                  setEditedCert({ ...editedCert, name: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={editedCert.domain}
                onChange={(e) =>
                  setEditedCert({ ...editedCert, domain: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={editedCert.expiryDate}
                onChange={(e) =>
                  setEditedCert({ ...editedCert, expiryDate: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button onClick={handleSaveCert} variant="primary" className="w-full">
              Save Changes
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};
