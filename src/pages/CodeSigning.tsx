import { useEffect, useState } from 'react';
import type { CodeSigningKey, ViewMode } from '../types';
import { Grid, List, Shield, Key } from 'lucide-react';
import { TableSkeleton, CardSkeleton } from '../components/common/Skeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { storageUtils } from '../utils/storage';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';
import codeSigningData from '../data/code-signing-keys.json';

export const CodeSigning = () => {
  const [keys, setKeys] = useState<CodeSigningKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [protectionFilter, setProtectionFilter] = useState<'HSM' | 'Software' | ''>('');

  useEffect(() => {
    loadData();
    const savedView = storageUtils.getPreference<ViewMode>('codeSigningView', 'table');
    setViewMode(savedView);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);

      const cached = storageUtils.get<CodeSigningKey[]>('code-signing-keys');
      if (cached) {
        setKeys(cached);
        setLoading(false);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      setKeys(codeSigningData as CodeSigningKey[]);
      storageUtils.set('code-signing-keys', codeSigningData);
      setLoading(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  const toggleView = () => {
    const newView = viewMode === 'table' ? 'grid' : 'table';
    setViewMode(newView);
    storageUtils.setPreference('codeSigningView', newView);
  };

  const filteredKeys = protectionFilter
    ? keys.filter((key) => key.protectionLevel === protectionFilter)
    : keys;

  const getProtectionBadge = (level: CodeSigningKey['protectionLevel']) => {
    if (level === 'HSM') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <Shield className="w-3 h-3" />
          HSM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        <Key className="w-3 h-3" />
        Software
      </span>
    );
  };

  const getStatusBadge = (status: CodeSigningKey['status']) => {
    if (status === 'active') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Expired
      </span>
    );
  };

  if (loading && keys.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Code Signing Keys
        </h1>
        {viewMode === 'table' ? <TableSkeleton rows={8} /> : <CardSkeleton />}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Code Signing Keys
        </h1>
        <ErrorDisplay onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Code Signing Keys
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setProtectionFilter('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                protectionFilter === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setProtectionFilter('HSM')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                protectionFilter === 'HSM'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              HSM
            </button>
            <button
              onClick={() => setProtectionFilter('Software')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                protectionFilter === 'Software'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Software
            </button>
          </div>

          <button
            onClick={toggleView}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {viewMode === 'table' ? (
              <>
                <Grid className="w-4 h-4" />
                Grid View
              </>
            ) : (
              <>
                <List className="w-4 h-4" />
                Table View
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Key Alias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Algorithm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Protection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredKeys.map((key) => (
                  <tr
                    key={key.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {key.keyAlias}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {key.algorithm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getProtectionBadge(key.protectionLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {key.usage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {formatRelativeTime(key.lastUsed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(key.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKeys.map((key) => (
            <div
              key={key.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {key.protectionLevel === 'HSM' ? (
                    <Shield className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Key className="w-8 h-8 text-gray-600" />
                  )}
                  <div>
                    {getProtectionBadge(key.protectionLevel)}
                  </div>
                </div>
                {getStatusBadge(key.status)}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {key.keyAlias}
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Algorithm:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {key.algorithm}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Usage:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {key.usage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(key.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Last Used:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatRelativeTime(key.lastUsed)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(key.expiryDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
