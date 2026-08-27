'use client';

import { useEffect } from 'react';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, children, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, variant = 'primary', loading = false }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="text-sm text-gray-600 mb-6">{children}</div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelText}</Button>
          {onConfirm && <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmText}</Button>}
        </div>
      </div>
    </div>
  );
}
