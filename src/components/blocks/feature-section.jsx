'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeatureSteps({
  features,
  title = 'How It Works',
  autoPlayInterval = 4000,
  imageHeight = 'h-[400px]',
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  }, [features.length]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, autoPlayInterval);
    return () => clearInterval(id);
  }, [paused, advance, autoPlayInterval]);

  const handleStepClick = (idx) => {
    setActiveIndex(idx);
    setPaused(true);
    setTimeout(() => setPaused(false), autoPlayInterval * 2);
  };

  return (
    <div className="py-12 md:py-16">
      <h2
        className="text-2xl md:text-3xl font-[700] text-center mb-10 text-[#1a1a2e]"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {title}
      </h2>

      <div className="grid gap-8 lg:grid-cols-2 items-center">
        {/* Left — Steps */}
        <div className="flex flex-col gap-0">
          {features.map((feature, idx) => {
            const isActive = idx === activeIndex;
            const isCompleted = idx < activeIndex;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleStepClick(idx)}
                className="flex items-start gap-4 text-left group cursor-pointer bg-transparent border-none p-0"
              >
                {/* Progress column */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-[700] transition-all duration-300 ${
                      isCompleted
                        ? 'border-[#059669] bg-[#059669] text-white'
                        : isActive
                        ? 'border-[#224c87] bg-[#224c87] text-white'
                        : 'border-[#d7def0] bg-white text-[#919090]'
                    }`}
                  >
                    {isCompleted ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Connecting line */}
                  {idx < features.length - 1 && (
                    <div
                      className={`w-[2px] transition-colors duration-300 ${
                        isCompleted ? 'bg-[#059669]' : isActive ? 'bg-[#224c87]' : 'bg-[#e2e6ed]'
                      }`}
                      style={{ height: '100%', minHeight: 48 }}
                    />
                  )}
                </div>

                {/* Text content */}
                <div className={`pb-8 ${idx === features.length - 1 ? 'pb-0' : ''}`}>
                  <span
                    className={`text-[11px] uppercase tracking-[0.14em] font-[600] transition-colors duration-300 ${
                      isActive ? 'text-[#224c87]' : 'text-[#919090]'
                    }`}
                    style={{ fontFamily: 'Arial, sans-serif' }}
                  >
                    {feature.step}
                  </span>
                  <h3
                    className={`mt-1 text-[16px] md:text-[18px] font-[600] transition-colors duration-300 ${
                      isActive ? 'text-[#224c87]' : 'text-[#919090]'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {feature.title}
                  </h3>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[14px] text-[#465063] leading-relaxed overflow-hidden"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {feature.content}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right — Image */}
        <div className={`relative ${imageHeight} rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgba(34,76,135,0.12)]`}>
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={features[activeIndex].image}
              alt={features[activeIndex].title}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Step indicator dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {features.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleStepClick(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
