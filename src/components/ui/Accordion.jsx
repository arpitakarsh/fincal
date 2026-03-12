"use client"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "@radix-ui/react-icons"

const Accordion = AccordionPrimitive.Root
const AccordionItem = AccordionPrimitive.Item

function AccordionTrigger({ children, ...props }) {
  return (
    <AccordionPrimitive.Header style={{ margin: 0 }}>
      <AccordionPrimitive.Trigger
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12,
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
        {...props}
      >
        {children}
        <ChevronDownIcon
          width={16}
          height={16}
          style={{
            color: 'rgba(255,255,255,0.7)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
          className="accordion-chevron"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ children, ...props }) {
  return (
    <AccordionPrimitive.Content
      style={{ overflow: 'hidden' }}
      className="accordion-content"
      {...props}
    >
      <div style={{
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '0 0 12px 12px',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
