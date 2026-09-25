import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-600 text-sm font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-2" />
      <p className="text-xs font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
