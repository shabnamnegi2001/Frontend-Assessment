import { useEffect, useState } from 'react';
import type { SSHKey, SortConfig } from '../types';
import { Search, ChevronDown, ChevronRight, Bookmark } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { storageUtils } from '../utils/storage';
import { formatRelativeTime } from '../utils/dateUtils';
import { useDebounce } from '../hooks/useDebounce';
import sshKeysData from '../data/ssh-keys.json';

export const SSHKeys = () => {
  const [sshKeys, setSSHKeys] = useState<SSHKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<SSHKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'trustLevel',
    direction: 'desc',
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [sshKeys, debouncedSearch, sortConfig]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);

      const cached = storageUtils.get<SSHKey[]>('ssh-keys');
      if (cached) {
        setSSHKeys(cached);
        setLoading(false);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      setSSHKeys(sshKeysData as SSHKey[]);
      storageUtils.set('ssh-keys', sshKeysData);
      setLoading(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let result = [...sshKeys];

    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(
        (key) =>
          key.keyOwner.toLowerCase().includes(search) ||
          key.fingerprint.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortConfig.field === 'trustLevel') {
        const levels = { high: 3, medium: 2, low: 1 };
        const aLevel = levels[a.trustLevel];
        const bLevel = levels[b.trustLevel];
        return sortConfig.direction === 'asc'
          ? aLevel - bLevel
          : bLevel - aLevel;
      }

      const aValue = a[sortConfig.field as keyof SSHKey];
      const bValue = b[sortConfig.field as keyof SSHKey];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    setFilteredKeys(result);
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

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getTrustLevelBadge = (level: SSHKey['trustLevel']) => {
    const styles = {
      high: 'bg-green-500 text-white',
      medium: 'bg-orange-500 text-white',
      low: 'bg-red-500 text-white',
    };

    const icons = {
      high: '✓',
      medium: '⚠',
      low: '⊗',
    };

    const labels = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles[level]}`}>
        <span>{icons[level]}</span>
        {labels[level]}
      </span>
    );
  };

  if (loading && sshKeys.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          SSH Keys
        </h1>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          SSH Keys
        </h1>
        <ErrorDisplay onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          SSH Keys
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Discover, search, and assess trust for SSH keys across your fleet.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            SSH Key Inventory
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {sshKeys.length} keys · debounced search · sorted by trust level
          </p>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search owner or fingerprint"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                onClick={() => handleSort('trustLevel')}
              >
                <span>Sort</span>
                <span className="font-medium">Trust (High → Low)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                Bookmarked only
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="w-12 px-6 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Key Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Fingerprint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Trust Level
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredKeys.map((key) => (
                <>
                  <tr
                    key={key.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button onClick={() => toggleRow(key.id)} className="text-gray-400 hover:text-gray-600">
                        {expandedRows.has(key.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {key.keyOwner}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {key.keyType === 'ed25519' ? 'CI/CD automation' : key.keyType === 'rsa-4096' ? 'Staff engineer' : 'Deprecated pipeline key'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-mono">
                        {key.fingerprint}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatRelativeTime(key.lastUsed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getTrustLevelBadge(key.trustLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium mr-4">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium mr-4">
                        Edit
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Bookmark className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(key.id) && (
                    <tr key={`${key.id}-expanded`} className="bg-gray-50 dark:bg-gray-700/20">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="animate-expand pl-10">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Associated servers ({key.servers.length})
                          </h4>
                          <div className="space-y-2">
                            {key.servers.map((server, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-sm">
                                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                                  {server.name}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                            Key type: {key.keyType} · Created 2024-06-11 · Managed via GitOps
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing 1-3 of {filteredKeys.length} SSH keys
          </div>
        </div>
      </div>
    </div>
  );
};
