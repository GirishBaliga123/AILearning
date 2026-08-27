'use client';

export default function Input({ label, id, type = 'text', error, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
      <input id={id} type={type} className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 text-gray-900 placeholder-gray-400'}`} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
