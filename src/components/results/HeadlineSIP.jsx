'use client';

import CountUp from 'react-countup';

export default function HeadlineSIP({ results, fv, yrs, inflation }) {
  if (!results) return null;

  const sip = results.sip;

  if (sip <= 0) {
    return (
      <div style={{
        background: '#f0fdf4',
        borderRadius: 16,
        padding: '24px',
        border: '2px solid #86efac',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>🎉</p>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 20, color: '#16a34a', marginBottom: 6 }}>
          You're already there!
        </p>
        <p style={{ fontSize: 13, color: '#15803d' }}>
          Your lumpsum investment already covers this goal. No SIP needed.
        </p>
        <p style={{ fontSize: 12, color: '#919090', marginTop: 8 }}>
          * Estimated value. Illustrative only.
        </p>
      </div>
    );
  }

  if (sip > 500000) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px',
        border: '2px solid #da3832',
      }}>
        <p style={{ color: '#919090', fontSize: 14, marginBottom: 8 }}>
          Monthly SIP Required
        </p>
        <h1 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(28px, 5vw, 42px)',
          color: '#da3832',
          marginBottom: 4,
        }}>
          ₹<CountUp end={sip} duration={1} separator="," decimals={0} />
        </h1>
        <div style={{
          background: '#fff5f5',
          border: '1px solid #fecaca',
          borderRadius: 10,
          padding: '10px 14px',
          marginTop: 12,
        }}>
          <p style={{ fontSize: 13, color: '#da3832', fontWeight: 600, marginBottom: 4 }}>
            ⚠️ This SIP amount may be unrealistic
          </p>
          <p style={{ fontSize: 12, color: '#b91c1c' }}>
            Consider extending your timeline, increasing your lumpsum, or revising your goal amount.
          </p>
        </div>
        <p style={{ fontSize: 12, color: '#919090', marginTop: 10 }}>
          * Estimated value. Illustrative only.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '24px',
      border: '1px solid #e2e6ed',
    }}>
      <p style={{ color: '#919090', fontSize: 14, marginBottom: 8 }}>
        Monthly SIP Required
      </p>
      <h1 style={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(28px, 5vw, 42px)',
        color: '#224c87',
        marginBottom: 4,
      }}>
        ₹<CountUp end={sip} duration={1} separator="," decimals={0} />
      </h1>
      <p style={{ color: '#919090', fontSize: 13, marginTop: 8 }}>
        Goal value in {yrs}y at {inflation}% inflation ={' '}
        <span style={{ color: '#1a1a2e', fontWeight: 600 }}>
          ₹<CountUp end={fv} duration={1} separator="," decimals={0} />
        </span>
      </p>
      <p style={{ fontSize: 12, color: '#919090', marginTop: 6 }}>
        * Estimated value. Illustrative only.
      </p>
    </div>
  );
}