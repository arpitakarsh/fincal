import React from 'react';

interface Props {
  title?: string;
  children: React.ReactNode;
}

export function AIInsightCard({ title = "AI Insight", children }: Props) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3 border-b border-blue-200 pb-2">
        <span className="text-xl">✨</span>
        <h4 className="font-bold text-blue-900">{title}</h4>
      </div>
      <div className="text-sm text-blue-800 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
