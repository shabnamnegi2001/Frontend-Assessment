import { useEffect, useState } from 'react';
import type { CodeSigningKey, ViewMode } from '../types';
import { Grid, List, Shield, Key, ChevronDown, Search, LayoutGrid } from 'lucide-react';
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-green-500 text-white">
          <Shield className="w-3 h-3" />
          HSM-backed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-orange-500 text-white">
        <Key className="w-3 h-3" />
        Soft token
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Code Signing Keys
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage signing identities for binaries, containers, and artifacts.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Signing key inventory
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {keys.length} keys · HSM and software-backed · table and grid views
          </p>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by alias or algorithm"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                <span>Sort</span>
                <span className="font-medium">Last used (recent first)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                <span>Protection</span>
                <span className="font-medium">All levels</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'table'
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm border-l border-gray-300 dark:border-gray-600 ${
                    viewMode === 'grid'
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Key Alias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Algorithm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Protection Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredKeys.map((key) => (
                  <tr
                    key={key.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {key.keyAlias}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {key.usage}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {key.algorithm}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getProtectionBadge(key.protectionLevel)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatRelativeTime(key.lastUsed)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium mr-4">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                        Rotate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Grid view preview
            </div>
            <div className="mb-6 text-xs text-gray-500 dark:text-gray-400">
              Cards highlight protection level and recency.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-5 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {key.protectionLevel === 'HSM' ? (
                        <Shield className="w-5 h-5 text-green-500" />
                      ) : (
                        <Key className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    {getProtectionBadge(key.protectionLevel)}
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {key.keyAlias}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{key.algorithm} · {key.protectionLevel === 'HSM' ? 'HSM-backed' : 'Soft token'}</p>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Created {formatDate(key.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last used {formatRelativeTime(key.lastUsed)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{key.usage}</span>
                    <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing 1-5 of {filteredKeys.length} signing keys
          </div>
        </div>
      </div>
    </div>
  );
};
