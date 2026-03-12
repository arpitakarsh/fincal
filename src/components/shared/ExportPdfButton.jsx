'use client';

import { useState } from 'react';

export default function ExportPdfButton({ isFloating }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById('export-report');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FinCal-Report-${new Date().toLocaleDateString('en-IN')}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const floatingClass = isFloating
    ? 'fixed bottom-[80px] right-[20px] shadow-lg z-40'
    : 'mt-4 sm:absolute sm:top-5 sm:right-6 sm:mt-0';

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className={`
        flex items-center gap-2 bg-white border border-[#e2e6ed] rounded-[10px]
        px-[16px] py-[8px] text-[13px] font-[600] text-[#224c87]
        transition-all duration-150 hover:bg-[#f0f4ff] hover:border-[#224c87]
        ${exporting ? 'opacity-70 cursor-not-allowed' : ''}
        ${floatingClass}
      `}
    >
      {exporting ? (
        <svg className="animate-spin h-4 w-4 text-[#224c87]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      )}
      {exporting ? 'Generating...' : 'Export Report'}
    </button>
  );
}
