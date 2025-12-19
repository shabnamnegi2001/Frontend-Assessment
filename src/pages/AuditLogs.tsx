import { useEffect, useState, useRef } from 'react';
import type { AuditLog } from '../types';
import { ChevronDown, Calendar, Filter } from 'lucide-react';
import { TableSkeleton } from '../components/common/Skeleton';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { storageUtils } from '../utils/storage';
import { formatDateTime } from '../utils/dateUtils';
import auditLogsData from '../data/audit-logs.json';

const ITEMS_PER_PAGE = 15;

export const AuditLogs = () => {
  const [allLogs, setAllLogs] = useState<AuditLog[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [allLogs]);

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

  const getActionTypeBadge = (actionType: string) => {
    let bgColor = 'bg-gray-500';
    let icon = '●';

    if (actionType.includes('created') || actionType.includes('renewed') || actionType.includes('LOGIN')) {
      bgColor = 'bg-green-500';
      icon = '✓';
    } else if (actionType.includes('revoked') || actionType.includes('failed') || actionType.includes('expired') || actionType.includes('ROTATED')) {
      bgColor = 'bg-red-500';
      icon = '🔄';
    } else if (actionType.includes('updated') || actionType.includes('modified') || actionType.includes('UPLOADED')) {
      bgColor = 'bg-orange-500';
      icon = '⬆';
    } else if (actionType.includes('DENIED')) {
      bgColor = 'bg-red-500';
      icon = '⊘';
    } else if (actionType.includes('CHANGED')) {
      bgColor = 'bg-orange-500';
      icon = '⚠';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium ${bgColor} text-white uppercase`}>
        {icon} {actionType.replace(/_/g, ' ')}
      </span>
    );
  };

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Audit Logs
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Trace all identity-related actions across certificates and keys.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Log stream
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time view of configuration and access changes across all identity assets.
          </p>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span>Action type</span>
                  <span className="font-medium">All actions</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span>From</span>
                  <span className="font-medium">2025-01-01 00:00</span>
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span>To</span>
                  <span className="font-medium">2025-03-03 23:59</span>
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                <Filter className="w-4 h-4" />
                Search actor, resource, metadata
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="p-6 space-y-4">
            {displayedLogs.map((log) => (
              <div key={log.id}>
                <div
                  className="flex gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 p-4 rounded-lg transition-colors"
                  onClick={() => toggleRow(log.id)}
                >
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} ago
                    </div>
                  </div>

                  <div className="flex-shrink-0 pt-1">
                    {getActionTypeBadge(log.actionType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 dark:text-white mb-1">
                      <span className="font-medium">{log.actor}</span>
                      <span className="text-gray-600 dark:text-gray-400 mx-2">·</span>
                      <span className="text-gray-600 dark:text-gray-400">{log.targetResource}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm">
                      {expandedRows.has(log.id) ? '▴' : 'Expand'}
                    </button>
                  </div>
                </div>

                {expandedRows.has(log.id) && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 mt-2 animate-expand">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/20 rounded-lg">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">
                        Metadata · {expandedRows.has(log.id) ? 'Decoded JSON' : 'request id req_49124z63'}
                      </h4>
                      <pre className="p-3 bg-gray-900 dark:bg-gray-950 text-green-400 rounded text-xs font-mono overflow-x-auto">
{JSON.stringify(log.metadata, null, 2)}</pre>
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        Trimmed for preview
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {hasMore && (
          <div ref={observerTarget} className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Load older events
            </button>
          </div>
        )}

        {!hasMore && displayedLogs.length > 0 && (
          <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2">
              <span>📅</span>
              <span>Showing latest 100 of 4,302 events in range</span>
            </div>
            <button className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs">
              ◀ Show only bookmarked
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
