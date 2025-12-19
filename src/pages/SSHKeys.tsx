import { useEffect, useState } from 'react';
import type { SSHKey, SortConfig } from '../types';
import { Search, ChevronDown, ChevronUp, Server } from 'lucide-react';
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

  const getTrustLevelColor = (level: SSHKey['trustLevel']) => {
    const colors = {
      high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[level];
  };

  const getTrustLevelIndicator = (level: SSHKey['trustLevel']) => {
    const colors = {
      high: 'bg-green-500',
      medium: 'bg-yellow-500',
      low: 'bg-red-500',
    };
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[level]}`} />
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrustLevelColor(level)}`}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
      </div>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          SSH Keys
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by owner or fingerprint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredKeys.length} keys found
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-12 px-6 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Key Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fingerprint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Used
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('trustLevel')}
                >
                  Trust Level {sortConfig.field === 'trustLevel' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Key Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredKeys.map((key) => (
                <>
                  <tr
                    key={key.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => toggleRow(key.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {expandedRows.has(key.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {key.keyOwner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono text-xs">
                      {key.fingerprint.substring(0, 30)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {formatRelativeTime(key.lastUsed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getTrustLevelIndicator(key.trustLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {key.keyType}
                    </td>
                  </tr>
                  {expandedRows.has(key.id) && (
                    <tr key={`${key.id}-expanded`} className="bg-gray-50 dark:bg-gray-700/30">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="animate-expand">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Server className="w-4 h-4" />
                            Associated Servers ({key.servers.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {key.servers.map((server, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                              >
                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                  {server.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  {server.ip}
                                </div>
                              </div>
                            ))}
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
      </div>
    </div>
  );
};
