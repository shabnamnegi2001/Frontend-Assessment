import { useEffect, useState, useRef } from 'react';
import type { AuditLog, ActionType } from '../types';
import { ChevronDown, ChevronUp, Calendar, Filter } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { storageUtils } from '../utils/storage';
import { formatDateTime, isDateInRange } from '../utils/dateUtils';
import auditLogsData from '../data/audit-logs.json';

const ITEMS_PER_PAGE = 15;

export const AuditLogs = () => {
  const [allLogs, setAllLogs] = useState<AuditLog[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [actionTypeFilter, setActionTypeFilter] = useState<ActionType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [allLogs, actionTypeFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadMore();
  }, [filteredLogs, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);

      const cached = storageUtils.get<AuditLog[]>('audit-logs');
      if (cached) {
        setAllLogs(cached);
        setLoading(false);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      setAllLogs(auditLogsData as AuditLog[]);
      storageUtils.set('audit-logs', auditLogsData);
      setLoading(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let result = [...allLogs];

    if (actionTypeFilter) {
      result = result.filter((log) => log.actionType === actionTypeFilter);
    }

    if (dateFrom || dateTo) {
      result = result.filter((log) =>
        isDateInRange(log.timestamp, dateFrom, dateTo)
      );
    }

    setFilteredLogs(result);
    setPage(1);
    setDisplayedLogs([]);
  };

  const loadMore = () => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    const newLogs = filteredLogs.slice(startIndex, endIndex);

    setDisplayedLogs(newLogs);
    setHasMore(endIndex < filteredLogs.length);
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

  const getActionTypeColor = (actionType: string) => {
    if (actionType.includes('created') || actionType.includes('renewed')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    if (actionType.includes('revoked') || actionType.includes('failed') || actionType.includes('expired')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
    if (actionType.includes('updated') || actionType.includes('modified')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
    if (actionType.includes('warning')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const uniqueActionTypes = Array.from(
    new Set(allLogs.map((log) => log.actionType))
  ).sort();

  if (loading && allLogs.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Audit Logs
        </h1>
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Audit Logs
        </h1>
        <ErrorDisplay onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Audit Logs
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Action Type
            </label>
            <select
              value={actionTypeFilter}
              onChange={(e) => setActionTypeFilter(e.target.value as ActionType | '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              {uniqueActionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {displayedLogs.length} of {filteredLogs.length} logs
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="w-12 px-6 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Target Resource
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayedLogs.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => toggleRow(log.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {expandedRows.has(log.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {log.actor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(
                          log.actionType
                        )}`}
                      >
                        {log.actionType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {log.targetResource}
                    </td>
                  </tr>
                  {expandedRows.has(log.id) && (
                    <tr key={`${log.id}-expanded`} className="bg-gray-50 dark:bg-gray-700/30">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="animate-expand">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Metadata
                          </h4>
                          <pre className="p-4 bg-gray-900 dark:bg-gray-950 text-green-400 rounded-lg overflow-x-auto text-xs font-mono">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div ref={observerTarget} className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Loading more logs...
            </p>
          </div>
        )}

        {!hasMore && displayedLogs.length > 0 && (
          <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
            No more logs to load
          </div>
        )}
      </div>
    </div>
  );
};
