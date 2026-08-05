import Link from 'next/link';
import { Wallet, PlusCircle } from 'lucide-react';

export function DashboardEmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wallet className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to FinCal</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        You don&apos;t have any portfolio holdings or active goals yet. Let&apos;s get started on your financial journey.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/goals"
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create a Goal
        </Link>
        <Link
          href="/portfolio/holdings/create"
          className="flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Holding
        </Link>
      </div>
    </div>
  );
}
