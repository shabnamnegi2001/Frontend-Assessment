import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorDisplay = ({
  message = 'Failed to load data. Please try again.',
  onRetry,
}: ErrorDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Error Loading Data
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};
