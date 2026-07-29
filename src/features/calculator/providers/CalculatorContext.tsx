// @ts-nocheck
import React, { createContext, useContext } from 'react';
import { useCalculator } from '../hooks/useCalculator';

const CalculatorContext = createContext<ReturnType<typeof useCalculator> | null>(null);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const calculatorState = useCalculator();
  return (
    <CalculatorContext.Provider value={calculatorState}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorContext() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider');
  }
  return context;
}
