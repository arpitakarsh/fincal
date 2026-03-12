import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { COLORS } from '../../lib/constants';

// Radix UI Tooltip Wrapper
export default function Tooltip({ children, content, side = 'top', align = 'center' }) {
  if (!content) return <>{children}</>;

  return (
    <TooltipPrimitive.Provider delayDuration={200} skipDelayDuration={0}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={4}
            collisionPadding={10}
            className="z-50 max-w-[260px] rounded-md px-3 py-2 text-sm leading-relaxed shadow-lg"
            style={{ 
              backgroundColor: '#1a1a2e', 
              color: '#ffffff', 
              animation: 'in 0.2s ease-out'
            }}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-[#1a1a2e]" width={11} height={5} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
