'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '\ud83d\udcca' },
  { href: '/transactions', label: 'Transactions', icon: '\ud83d\udcb0' },
  { href: '/categories', label: 'Categories', icon: '\ud83d\udcc2' },
  { href: '/reports', label: 'Reports', icon: '\ud83d\udcc8' },
  { href: '/settings/budgets', label: 'Budgets', icon: '\ud83c\udfaf' },
  { href: '/settings/recurring', label: 'Recurring', icon: '\ud83d\udd04' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
          <span className="text-2xl">\ud83d\udcb8</span>
          <h1 className="text-xl font-bold text-gray-900">MyBillLedger</h1>
        </div>

        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
