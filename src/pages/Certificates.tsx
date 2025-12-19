import { useEffect, useState } from 'react';
import type { Certificate, SortConfig } from '../types';
import { Eye, Edit, Search, ChevronDown, Download } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Drawer } from '../components/common/Drawer';
import { TableSkeleton } from '../components/common/Skeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { Pagination } from '../components/common/Pagination';
import { storageUtils } from '../utils/storage';
import { formatDate, getDaysUntilExpiry } from '../utils/dateUtils';
import certificatesData from '../data/certificates.json';

const ITEMS_PER_PAGE = 5;

export const Certificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCerts, setFilteredCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [domainFilter, setDomainFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'expiryDate',
    direction: 'asc',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [certificates, domainFilter, sortConfig]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);

      // Try to load from cache first
      const cached = storageUtils.get<Certificate[]>('certificates');
      if (cached) {
        setCertificates(cached);
        setLoading(false);
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setCertificates(certificatesData as Certificate[]);
      storageUtils.set('certificates', certificatesData);
      setLoading(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let result = [...certificates];

    // Filter by domain
    if (domainFilter) {
      result = result.filter((cert) =>
        cert.domain.toLowerCase().includes(domainFilter.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortConfig.field as keyof Certificate];
      const bValue = b[sortConfig.field as keyof Certificate];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    setFilteredCerts(result);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    setSortConfig({
      field,
      direction:
        sortConfig.field === field && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  const handleView = (cert: Certificate) => {
    setSelectedCert(cert);
    setShowModal(true);
  };

  const handleEdit = (cert: Certificate) => {
    setEditingCert({ ...cert });
    setShowDrawer(true);
  };

  const handleSaveEdit = () => {
    if (editingCert) {
      const updated = certificates.map((c) =>
        c.id === editingCert.id ? editingCert : c
      );
      setCertificates(updated);
      storageUtils.set('certificates', updated);
      setShowDrawer(false);
      setEditingCert(null);
    }
  };

  const getStatusBadge = (status: Certificate['status']) => {
    const styles = {
      active: 'bg-green-500 text-white',
      expired: 'bg-red-500 text-white',
      expiring_soon: 'bg-orange-500 text-white',
    };

    const icons = {
      active: '✓',
      expired: '⊗',
      expiring_soon: '⚠',
    };

    const labels = {
      active: 'Active',
      expired: 'Expired',
      expiring_soon: 'Expiring soon',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        <span>{icons[status]}</span>
        {labels[status]}
      </span>
    );
  };

  const expiringSoonCount = certificates.filter(c => c.status === 'expiring_soon').length;

  if (loading && certificates.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Certificates
        </h1>
        <TableSkeleton rows={ITEMS_PER_PAGE} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Certificates
        </h1>
        <ErrorDisplay onRetry={loadData} />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredCerts.length / ITEMS_PER_PAGE);
  const paginatedData = filteredCerts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Certificates
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage TLS certificates across your fleet.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Certificate Inventory
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {certificates.length} certificates · {expiringSoonCount} expiring in the next 30 days
          </p>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span>Domain</span>
                  <span className="font-medium">All domains</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  onClick={() => handleSort('expiryDate')}
                >
                  <span>Sort</span>
                  <span className="font-medium">Expiry (soonest)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative">
                <span className="text-sm text-gray-600 dark:text-gray-400">Per page</span>
                <button className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium">
                  {ITEMS_PER_PAGE}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Certificate Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Issuer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedData.map((cert) => (
                <tr
                  key={cert.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {cert.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {cert.domain}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {cert.issuer}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(cert.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDate(cert.expiryDate)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleView(cert)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(cert)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCerts.length)} of {filteredCerts.length} certificates
          </div>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredCerts.length}
          />
        )}
      </div>

      {/* View Modal */}
      {selectedCert && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Certificate Details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Certificate Name
                </label>
                <p className="text-gray-900 dark:text-white">{selectedCert.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Domain
                </label>
                <p className="text-gray-900 dark:text-white">{selectedCert.domain}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Issuer
                </label>
                <p className="text-gray-900 dark:text-white">{selectedCert.issuer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <div className="mt-1">{getStatusBadge(selectedCert.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Algorithm
                </label>
                <p className="text-gray-900 dark:text-white">{selectedCert.algorithm}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Serial Number
                </label>
                <p className="text-gray-900 dark:text-white font-mono text-xs">
                  {selectedCert.serialNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Issued Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedCert.issuedDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Expiry Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedCert.expiryDate)}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Drawer */}
      {editingCert && (
        <Drawer
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          title="Edit Certificate"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certificate Name
              </label>
              <input
                type="text"
                value={editingCert.name}
                onChange={(e) =>
                  setEditingCert({ ...editingCert, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={editingCert.domain}
                onChange={(e) =>
                  setEditingCert({ ...editingCert, domain: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issuer
              </label>
              <input
                type="text"
                value={editingCert.issuer}
                onChange={(e) =>
                  setEditingCert({ ...editingCert, issuer: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={handleSaveEdit}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </Drawer>
      )}
    </div>
  );
};
