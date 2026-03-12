'use client';

import NumberCounter from '../ui/NumberCounter';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';
import AssumptionTransparency from '../shared/AssumptionTransparency';
import BorderBeam from '../magicui/border-beam';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../ui/Accordion';

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    setSize([window.innerWidth, window.innerHeight]);
    const updateSize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return { width: size[0], height: size[1] };
}

export default function HeadlineSIP({ results, fv, yrs, inflation, annualRet }) {
  const { width, height } = useWindowSize();
  const isSmall = width && width < 768;

  if (!results) return null;

  const sip = results.sip;

  if (sip <= 0) {
    return (
      <div style={{
        background: '#f0fdf4',
        borderRadius: 16,
        padding: '32px',
        border: '2px solid #86efac',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(34,76,135,0.12)',
      }}>
        <Confetti 
          width={width || 300} 
          height={height || 600} 
          recycle={false} 
          numberOfPieces={400} 
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
        />
        <p style={{ fontSize: 28, marginBottom: 8 }}>🎉</p>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 20, color: '#16a34a', marginBottom: 6 }}>
          You're already there!
        </p>
        <p style={{ fontSize: 13, color: '#15803d' }}>
          Your lumpsum investment already covers this goal. No monthly investment needed.
        </p>
        <div style={{ marginTop: 24 }}>
          <AssumptionTransparency />
        </div>
      </div>
    );
  }

  if (sip > 500000) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '32px',
        border: '2px solid #da3832',
        boxShadow: '0 8px 32px rgba(34,76,135,0.12)',
      }}>
        <p style={{ color: '#919090', fontSize: 14, marginBottom: 8 }}>
          Monthly SIP Required
        </p>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          fontSize: isSmall ? 48 : 56,
          color: '#da3832',
          marginBottom: 4,
          lineHeight: 1,
        }}>
          <NumberCounter
            value={Math.round(sip)}
            prefix="₹"
            duration={1000}
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
            }}
          />
        </h1>
        <div style={{
          background: '#fff5f5',
          border: '1px solid #fecaca',
          borderRadius: 10,
          padding: '10px 14px',
          marginTop: 12,
        }}>
          <p style={{ fontSize: 13, color: '#da3832', fontWeight: 600, marginBottom: 4 }}>
            ⚠️ This investment amount might be difficult to maintain
          </p>
          <p style={{ fontSize: 12, color: '#b91c1c' }}>
            Consider delaying your goal, increasing your starting lumpsum, or revising your target amount.
          </p>
        </div>
        <div style={{ marginTop: 24 }}>
          <AssumptionTransparency />
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{
      background: 'linear-gradient(135deg, #224c87 0%, #2f5fa3 100%)',
      borderRadius: 20,
      padding: '36px',
      border: '1px solid #1a3a68',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(34,76,135,0.12)',
    }}>
      {sip > 0 && !isSmall && (
        <BorderBeam duration={6} size={150} colorFrom="#93c5fd" colorTo="#ffffff" />
      )}
      {/* Texture Layer */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      
      {/* Background Watermark */}
      <div 
        style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-40px',
          fontSize: '200px',
          fontWeight: 800,
          color: 'rgba(255,255,255,0.03)',
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        ₹
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#e2e8f0', fontSize: isSmall ? 13 : 16, marginBottom: 4, fontWeight: 500 }}>
          You need to invest
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: isSmall ? 48 : 56,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '-1px',
          }}>
            <NumberCounter
              value={Math.round(sip)}
              prefix="₹"
              duration={1000}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
              }}
            />
          </h1>
          <span style={{ color: '#93c5fd', fontSize: isSmall ? 16 : 18, fontWeight: 500 }}>per month</span>
        </div>
      
      <div className="rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 mb-5" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
        <div className="flex-1 pl-3">
          <p style={{ fontSize: 11, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Goal after inflation</p>
          <p style={{ fontSize: 15, fontWeight: 600 }}><NumberCounter value={Math.round(fv)} prefix="₹" duration={1000} /></p>
        </div>
        <div className="flex-1 pl-3">
          <p style={{ fontSize: 11, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Time Horizon</p>
          <p style={{ fontSize: 15, fontWeight: 600 }}>{yrs} years</p>
        </div>
        <div className="flex-1 pl-3">
          <p style={{ fontSize: 11, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Expected Return</p>
          <p style={{ fontSize: 15, fontWeight: 600 }}>{annualRet}% p.a.</p>
        </div>
      </div>

      <Accordion type="single" collapsible style={{ marginTop: 16 }}>
        <AccordionItem value="formulas">
          <AccordionTrigger>
            How we calculated this (Formulas)
          </AccordionTrigger>
          <AccordionContent>
            <div style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 13,
              lineHeight: 1.8,
              fontFamily: 'monospace'
            }}>
              <p style={{ marginBottom: 12, color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Arial', letterSpacing: 1 }}>
                STEP 1 — INFLATION ADJUSTMENT
              </p>
              <p style={{ marginBottom: 16 }}>
                Future Value = Present Cost × (1 + Inflation)^Years
              </p>
              <p style={{ marginBottom: 12, color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Arial', letterSpacing: 1 }}>
                STEP 2 — REQUIRED SIP
              </p>
              <p style={{ marginBottom: 16 }}>
                SIP = FV × r ÷ [((1+r)^n − 1) × (1+r)]
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: 11,
                fontFamily: 'Arial',
                fontStyle: 'italic'
              }}>
                where r = annualReturn ÷ 12 ÷ 100, n = years × 12
              </p>
              <p style={{
                marginTop: 16,
                color: 'rgba(255,255,255,0.3)',
                fontSize: 11,
                fontFamily: 'Arial',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: 12
              }}>
                * All figures are estimated and illustrative only.
                Assumes constant monthly SIP and fixed annual return.
                Does not account for taxes or fund expenses.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </div>
    </div>
  );
}
