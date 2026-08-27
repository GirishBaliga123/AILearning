'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-6xl mb-4">⚠️</span>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        An unexpected error occurred. Please try again or contact support if the
        problem persists.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="secondary" onClick={() => (window.location.href = '/')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
