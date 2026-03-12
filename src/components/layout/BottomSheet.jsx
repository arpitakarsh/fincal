import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function BottomSheet({ isOpen, onClose, children }) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl lg:hidden"
          >
            {/* Drag Handle Area */}
            <div 
              className="flex w-full items-center justify-center rounded-t-3xl bg-white pb-2 pt-4 cursor-pointer"
              onClick={onClose} // Simple tap to close for now
            >
              <div className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pb-20 pt-2">
              <div className="mx-auto max-w-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold font-montserrat tracking-tight text-gray-900">
                    Detailed Analysis
                  </h2>
                  <button 
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
