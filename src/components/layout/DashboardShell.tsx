'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PieChart,
  Target,
  Search,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Calculator,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/portfolio', icon: PieChart },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Funds Explorer', href: '/funds', icon: Search },
  { name: 'SIP Calculator', href: '/calculator', icon: Calculator },
  { name: 'AI Assistant', href: '/assistant', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
] as const;

function NavContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  };

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2" {...(onNavigate ? { onClick: () => onNavigate() } : {})}>
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-xl font-bold text-white">
            F
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">FinCal</span>
        </Link>
      </div>

      {isPending ? (
        <div className="px-6 pb-6">
          <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
        </div>
      ) : session?.user ? (
        <div className="px-6 pb-6">
          <div className="flex items-center space-x-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? 'User'}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {session.user.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{session.user.name}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-0.5 flex items-center text-xs text-gray-500 transition-colors hover:text-red-600"
              >
                <LogOut className="mr-1 h-3 w-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.name}
              href={item.href}
              {...(onNavigate ? { onClick: () => onNavigate() } : {})}
              className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-blue-700' : 'text-gray-400'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute right-0 top-0 -mr-12 pt-4">
          <button
            type="button"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>
        <NavContent onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <NavContent />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-lg font-bold text-white">
              F
            </div>
            <span className="text-lg font-bold text-gray-900">FinCal</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-mr-2 rounded-md p-2 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
          <div className="mx-auto h-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
