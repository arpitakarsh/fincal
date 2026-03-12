'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import FeatureSteps from "@/components/blocks/feature-section";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import CountUp from "react-countup";

const SUBTITLES = [
  "Your dream house. Financially.",
  "Your child's education. Planned.",
  "Your dream wedding. Funded.",
];

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Goal Parser",
    desc: 'Type "Buy a house in 10 years for 50 lakhs" and we fill the form — estimated and illustrative only.',
  },
  {
    icon: "📈",
    title: "3 Scenario Analysis",
    desc: "Compare conservative, moderate, and aggressive return assumptions with estimated SIPs.",
  },
  {
    icon: "🔥",
    title: "Sensitivity Heatmap",
    desc: "See how estimated SIP changes across 36 combinations of inflation and return rates.",
  },
  {
    icon: "⏰",
    title: "Cost of Delay",
    desc: "Understand how much more you may need if you wait — illustrative only.",
  },
  {
    icon: "📉",
    title: "Step-Up SIP",
    desc: "Model annual SIP increases to match your growing income — estimated projections.",
  },
  {
    icon: "🎯",
    title: "Goal Reality Check",
    desc: "AI-powered confidence score on whether a goal looks achievable — illustrative only.",
  },
];

const STATS = [
  { value: 6, label: "Goal Types" },
  { value: 3, label: "Return Scenarios" },
  { value: 36, label: "Point Sensitivity Analysis" },
  { value: 1, label: "AI-Powered Insights" },
];

export default function Page() {
  const reduceMotion = useReducedMotion();
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % SUBTITLES.length);
    }, 3000);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const heroMotion = useMemo(
    () => ({
      hidden: { opacity: 0, y: 16 },
      show: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.08, ease: [0.16, 1, 0.3, 1] },
      },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10 md:py-16">
        <motion.section
          initial="hidden"
          animate="show"
          variants={heroMotion}
          className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center"
        >
          <motion.div variants={heroMotion} className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7def0] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#224c87]">
              ● HDFC Mutual Fund × FinCal
            </div>
            <h1 className="text-4xl md:text-5xl font-[700]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Goal-Based Investment{" "}
              <span className="text-[#224c87]">Calculator</span>
            </h1>
            <div className="h-7 text-base text-[#1a1a2e]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={subtitleIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: reduceMotion ? 0 : 0.4 }}
                  className="block font-[600]"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {SUBTITLES[subtitleIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="text-[15px] text-[#465063]" style={{ fontFamily: "Arial, sans-serif" }}>
              Calculate exactly how much SIP you need for any financial goal. Powered by smart assumptions — not
              guesswork. All figures are estimated and illustrative only.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center rounded-full bg-[#224c87] px-6 py-3 text-white text-[14px] font-[600] shadow-[0_8px_20px_rgba(34,76,135,0.18)]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Calculate My SIP →
              </Link>
              <button
                type="button"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center rounded-full border border-[#d7def0] px-6 py-3 text-[14px] font-[600] text-[#224c87] hover:bg-[#e8eef7]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                See How It Works
              </button>
            </div>
            <p className="text-[12px] text-[#919090]">
              Free · No login required · Illustrative only
            </p>
          </motion.div>

          <motion.div variants={heroMotion} className="relative">
            <div className="rounded-[20px] bg-[#224c87] p-6 text-white shadow-[0_16px_40px_rgba(34,76,135,0.2)] relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="relative z-10">
                <p className="text-[13px] text-[#cfe1ff]">Estimated SIP required</p>
                <p className="mt-2 text-[36px] font-[700]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  ₹5,338/month
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 rounded-[14px] border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.15)] p-3 text-[12px]">
                  <div className="text-white/90">
                    Goal after inflation
                    <div className="text-white font-[600] mt-1">₹12.7L</div>
                  </div>
                  <div className="text-white/90">
                    Time horizon
                    <div className="text-white font-[600] mt-1">10 years</div>
                  </div>
                  <div className="text-white/90">
                    Return (est.)
                    <div className="text-white font-[600] mt-1">12% p.a.</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <section className="mt-16 md:mt-20" id="how-it-works" ref={featuresRef}>
          <FeatureSteps
            features={[
              {
                step: 'Step 1',
                title: 'Set Your Financial Goal',
                content: 'Choose from House, Education, Wedding, Car, Travel, Healthcare, or General. Enter today\'s cost and when you need the money.',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2070&auto=format&fit=crop',
              },
              {
                step: 'Step 2',
                title: 'Adjust Your Assumptions',
                content: 'Set inflation rate, expected return, and risk profile. Smart defaults are pre-filled based on your goal type and time horizon.',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop',
              },
              {
                step: 'Step 3',
                title: 'Get Your SIP Instantly',
                content: 'See your estimated monthly SIP across Conservative, Moderate, and Aggressive scenarios. All figures are illustrative only.',
                image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2070&auto=format&fit=crop',
              },
            ]}
            title="How It Works"
            autoPlayInterval={4000}
            imageHeight="h-[400px]"
          />
        </section>

        <section className="mt-16 md:mt-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : idx * 0.05 }}
                className="rounded-[16px] border border-[#e2e6ed] bg-white p-5 shadow-[0_4px_20px_rgba(34,76,135,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_26px_rgba(34,76,135,0.12)]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8eef7]">
                  <span className="text-[18px]">{feature.icon}</span>
                </div>
                <h3 className="text-[16px] font-[600]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  {feature.title}
                </h3>
                <p className="mt-2 text-[14px] text-[#919090]" style={{ fontFamily: "Arial, sans-serif" }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-16" ref={statsRef}>
          <div className="rounded-[18px] bg-[#224c87] px-6 py-6 text-white">
            <div className="grid gap-4 md:grid-cols-4 text-center">
              {STATS.map((stat, idx) => (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <div className="text-[26px] font-[700]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    {statsInView ? <CountUp end={stat.value} duration={1.2} /> : stat.value}
                  </div>
                  <div className="text-[12px] text-white/80">{stat.label}</div>
                  {idx < STATS.length - 1 && (
                    <div className="hidden md:block h-6 w-px bg-white/25 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 md:mt-20 rounded-[20px] border border-[#e2e6ed] bg-white p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-[700]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Start planning in 30 seconds
          </h2>
          <p className="mt-3 text-[14px] text-[#919090]" style={{ fontFamily: "Arial, sans-serif" }}>
            No signup. No fees. All figures are estimated and illustrative only. Not financial advice.
          </p>
          <Link
            href="/calculator"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#224c87] px-8 h-[56px] text-white text-[15px] font-[600]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Calculate My SIP →
          </Link>
        </section>

        <footer className="mt-16 border-t border-[#e2e6ed] pt-6 pb-12 text-[12px] text-[#919090]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-[16px] font-[700]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              <span className="text-[#224c87]">Fin</span>
              <span className="text-[#da3832]">Cal</span>{" "}
              <span className="text-[12px] font-[500] text-[#919090]" style={{ fontFamily: "Arial, sans-serif" }}>
                by Arpit Kumar & Himanshu
              </span>
            </div>
            <div className="text-center text-[12px] text-[#919090]">
              Built for TECHNEX '26 · FinCal Innovation Hackathon · Co-sponsored by HDFC Mutual Fund
            </div>
            <div className="flex items-center gap-4 text-[12px] text-[#224c87]">
              <Link href="/calculator" className="hover:underline">Reverse Calculator</Link>
              <Link href="/calculator" className="hover:underline">Compare Goals</Link>
            </div>
          </div>
          <div className="mt-6 border-t border-[#e2e6ed] pt-4 text-center text-[12px] text-[#919090]">
            Mutual Fund investments are subject to market risks. All figures are estimated and illustrative only. Past
            performance is not indicative of future results. This does not constitute financial advice. HDFC AMC retains
            IP ownership.
          </div>
        </footer>
      </div>
    </div>
  );
}
