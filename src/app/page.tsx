import Link from 'next/link'
import Script from 'next/script'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NomadLedger — Invoicing Software for Digital Nomads | Multi-Currency Invoice App',
  description:
    'Invoice clients in GBP, EUR, USD from India. NomadLedger locks your exchange rate at invoice date — no more fluctuating income. Free tax estimate for 12 countries. Start free, no card needed.',
}

export default function LandingPage() {
  return (
    <>
      {/* SoftwareApplication Schema */}
      <Script
        id="schema-software-app"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "NomadLedger",
            "url": "https://nomadledger.online",
            "description": "Invoicing software for digital nomads. Invoice clients in GBP, EUR, USD — see everything in your home currency at the exact rate it was earned. Free tax estimate for 12 countries.",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "priceSpecification": [
                {
                  "@type": "UnitPriceSpecification",
                  "price": "0",
                  "priceCurrency": "USD",
                  "name": "Free Plan",
                  "description": "5 invoices/month, FX rate lock, basic tax estimate"
                },
                {
                  "@type": "UnitPriceSpecification",
                  "price": "19",
                  "priceCurrency": "USD",
                  "unitText": "MONTH",
                  "name": "Pro Plan",
                  "description": "Unlimited invoices, Razorpay payment links, 12 tax jurisdictions"
                }
              ]
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "12"
            },
            "creator": {
              "@type": "Person",
              "name": "Sohail Ansari"
            },
            "featureList": [
              "Multi-currency invoicing",
              "FX rate locking at invoice date",
              "Progressive tax bracket breakdown",
              "12 tax jurisdictions",
              "Razorpay payment links",
              "Deductible expense tracking"
            ],
            "screenshot": "https://nomadledger.online/og-image.png",
            "softwareVersion": "1.0"
          })
        }}
      />

      {/* FAQPage Schema */}
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is the best invoicing software for digital nomads in India?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "NomadLedger is built specifically for Indian digital nomads billing international clients. It locks your exchange rate at invoice creation using ECB historical data, calculates Indian income tax live, and integrates Razorpay payment links on every invoice."
                }
              },
              {
                "@type": "Question",
                "name": "How do I invoice international clients in GBP, EUR, or USD from India?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Create a client in NomadLedger, set their billing currency, and raise an invoice. The app fetches the ECB rate for that date, converts to INR, and locks both values permanently. Your client receives a professional PDF with a Razorpay payment link."
                }
              },
              {
                "@type": "Question",
                "name": "Does NomadLedger work for freelancers outside India?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. NomadLedger supports home currencies for 12 countries including India (INR), UK (GBP), US (USD), Germany (EUR), Portugal (EUR), Australia (AUD), Canada (CAD), Singapore (SGD), and more."
                }
              },
              {
                "@type": "Question",
                "name": "What is send-date FX locking and why does it matter for my taxes?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Send-date FX locking means your invoice's home-currency value is calculated using the exchange rate on the day you created the invoice — and never changes after that. This is the method required by India's Income Tax Act, the IRS (Publication 54), and HMRC for reporting foreign income."
                }
              },
              {
                "@type": "Question",
                "name": "Is there a free freelancer tax calculator for Indian digital nomads?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "NomadLedger includes a free progressive tax bracket calculator for India and 11 other countries. As you add invoices and log deductible expenses, your estimated tax liability updates live. The free tier is available with no credit card required."
                }
              }
            ]
          })
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

        .lp-root {
          background: #080c14;
          min-height: 100vh;
          color: #f0f4f8;
          font-family: var(--font-geist-sans, 'Inter', sans-serif);
          overflow-x: hidden;
        }
        .lp-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          z-index: 0;
        }

        /* NAV */
        .lp-nav {
          position: sticky; top: 0; z-index: 200;
          padding: 0 40px; height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(8,12,20,0.82);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .lp-logo {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: 20px; font-weight: 400;
          color: #f0f4f8; text-decoration: none; letter-spacing: -0.01em;
        }
        .lp-logo em { color: #4fa3e8; font-style: italic; }
        .lp-nav-right { display: flex; align-items: center; gap: 12px; }
        .lp-btn-ghost {
          font-size: 13px; font-weight: 500; padding: 8px 18px;
          border-radius: 40px; border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: #a8bdd0; text-decoration: none;
          transition: all 0.2s;
        }
        .lp-btn-ghost:hover { border-color: rgba(79,163,232,0.4); color: #f0f4f8; }
        .lp-btn-cta {
          font-size: 13px; font-weight: 600; padding: 8px 20px;
          border-radius: 40px; border: 1px solid transparent;
          background: #4fa3e8; color: #fff; text-decoration: none;
          box-shadow: 0 0 20px rgba(79,163,232,0.3);
          transition: all 0.2s;
        }
        .lp-btn-cta:hover { background: #7ec8fc; transform: translateY(-1px); }

        /* HERO */
        .lp-hero {
          position: relative; z-index: 1;
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 120px 24px 80px;
        }
        .lp-hero-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 900px; height: 600px; pointer-events: none;
          background: radial-gradient(ellipse 60% 60% at 50% 0%, rgba(79,163,232,0.18) 0%, transparent 70%);
        }
        .lp-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: #4fa3e8; background: rgba(79,163,232,0.1);
          padding: 6px 16px; border-radius: 40px; border: 1px solid rgba(79,163,232,0.25);
          margin-bottom: 28px;
        }
        .lp-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #4fa3e8;
          animation: lpPulse 2s infinite;
        }
        @keyframes lpPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(79,163,232,0.5); }
          50% { box-shadow: 0 0 0 5px transparent; }
        }
        .lp-h1 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(44px, 7vw, 88px);
          font-weight: 400; line-height: 1.02; letter-spacing: -0.02em;
          margin-bottom: 28px; max-width: 900px;
        }
        .lp-h1 .accent { color: #7ec8fc; font-style: italic; }
        .lp-h1 .dim { color: #3d5a6e; }
        .lp-sub {
          font-size: clamp(16px, 2vw, 19px); font-weight: 350;
          color: #a8bdd0; max-width: 560px; line-height: 1.8;
          margin: 0 auto 44px;
        }
        .lp-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .lp-btn-primary {
          background: #4fa3e8; color: #fff;
          font-size: 15px; font-weight: 600; padding: 14px 32px;
          border-radius: 40px; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 0 32px rgba(79,163,232,0.35);
          transition: all 0.2s;
        }
        .lp-btn-primary:hover { background: #7ec8fc; transform: translateY(-2px); box-shadow: 0 0 48px rgba(79,163,232,0.45); }
        .lp-btn-outline {
          background: rgba(255,255,255,0.04); color: #f0f4f8;
          font-size: 15px; font-weight: 500; padding: 14px 32px;
          border-radius: 40px; border: 1px solid rgba(255,255,255,0.1);
          text-decoration: none; backdrop-filter: blur(8px);
          transition: all 0.2s;
        }
        .lp-btn-outline:hover { border-color: rgba(79,163,232,0.4); background: rgba(255,255,255,0.07); }

        /* HERO CARD */
        .lp-card-wrap {
          margin-top: 64px; position: relative; max-width: 520px; width: 100%;
        }
        .lp-card-wrap::before {
          content: ''; position: absolute; inset: -1px;
          border-radius: 25px;
          background: linear-gradient(135deg, rgba(79,163,232,0.45), rgba(79,163,232,0.05) 60%, transparent);
          z-index: 0;
        }
        .lp-card {
          position: relative; z-index: 1;
          background: rgba(13,18,32,0.9);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 24px;
          padding: 24px; backdrop-filter: blur(16px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5); text-align: left;
        }
        .lp-card-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #2dd4bf; background: rgba(45,212,191,0.1);
          border: 1px solid rgba(45,212,191,0.25); border-radius: 20px;
          padding: 4px 10px; margin-bottom: 16px;
        }
        .lp-pill-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #2dd4bf;
          animation: lpPulse 2s infinite;
        }
        .lp-inv-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lp-inv-row:last-of-type { border-bottom: none; }
        .lp-inv-client { font-size: 13px; color: #a8bdd0; }
        .lp-inv-right { text-align: right; }
        .lp-inv-amount { font-size: 14px; font-weight: 600; color: #f0f4f8; }
        .lp-inv-home { font-size: 11px; color: #4fa3e8; margin-top: 2px; }
        .lp-card-total {
          margin-top: 16px; padding: 16px;
          background: linear-gradient(135deg, rgba(79,163,232,0.12), rgba(79,163,232,0.04));
          border: 1px solid rgba(79,163,232,0.2); border-radius: 12px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .lp-total-label { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #5a7a91; margin-bottom: 4px; }
        .lp-total-num { font-family: 'Instrument Serif', Georgia, serif; font-size: 28px; color: #f0f4f8; }
        .lp-tax-label { font-size: 10px; color: #5a7a91; text-align: right; margin-bottom: 4px; }
        .lp-tax-num { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; color: #2dd4bf; }

        /* STATS */
        .lp-stats {
          display: flex; gap: 48px; margin-top: 72px; flex-wrap: wrap; justify-content: center;
        }
        .lp-stat { text-align: center; }
        .lp-stat-num { font-family: 'Instrument Serif', Georgia, serif; font-size: 40px; color: #7ec8fc; }
        .lp-stat-lbl { font-size: 12px; color: #5a7a91; margin-top: 4px; letter-spacing: 0.02em; }

        /* TICKER */
        .lp-ticker {
          overflow: hidden; border-top: 1px solid rgba(255,255,255,0.07);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 14px 0; background: rgba(255,255,255,0.02); position: relative; z-index: 1;
        }
        .lp-ticker-track {
          display: flex; width: max-content;
          animation: lpTicker 35s linear infinite;
        }
        @keyframes lpTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .lp-ticker-item {
          white-space: nowrap; padding: 0 52px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
          color: #5a7a91; display: flex; align-items: center; gap: 12px;
        }
        .lp-ticker-dot { width: 4px; height: 4px; border-radius: 50%; background: #4fa3e8; flex-shrink: 0; }

        /* PAIN */
        .lp-pain {
          padding: 100px 24px; background: #0d1220; position: relative; z-index: 1;
        }
        .lp-pain::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(79,163,232,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .lp-section-inner { max-width: 1120px; margin: 0 auto; }
        .lp-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: #4fa3e8; margin-bottom: 16px;
        }
        .lp-label::before { content: ''; width: 20px; height: 1.5px; background: #4fa3e8; border-radius: 2px; }
        .lp-h2 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(38px, 5.5vw, 68px);
          font-weight: 400; line-height: 1.06; letter-spacing: -0.02em; color: #f0f4f8;
        }
        .lp-h2 .dim { color: #3d5a6e; }
        .lp-h2 .blue { color: #7ec8fc; font-style: italic; }
        .lp-pain-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 56px;
        }
        .lp-pain-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 32px 28px;
          transition: all 0.3s; cursor: default; position: relative; overflow: hidden;
        }
        .lp-pain-card:hover {
          border-color: rgba(79,163,232,0.3); transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.3);
          background: rgba(79,163,232,0.04);
        }
        .lp-pain-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; font-size: 22px;
          margin-bottom: 20px; background: rgba(79,163,232,0.1); border: 1px solid rgba(79,163,232,0.2);
        }
        .lp-pain-card h3 { font-size: 17px; font-weight: 600; color: #f0f4f8; margin-bottom: 10px; }
        .lp-pain-card p { font-size: 13.5px; color: #5a7a91; line-height: 1.75; }
        .lp-pain-card blockquote {
          margin-top: 16px; font-size: 12.5px; color: #5a7a91; font-style: italic;
          border-left: 2px solid rgba(79,163,232,0.4); padding-left: 12px;
        }

        /* PROOF */
        .lp-proof {
          padding: 36px 24px; border-top: 1px solid rgba(255,255,255,0.07);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02); position: relative; z-index: 1;
        }
        .lp-proof-inner {
          max-width: 1000px; margin: 0 auto;
          display: flex; gap: 32px; align-items: center; flex-wrap: wrap; justify-content: center;
        }
        .lp-proof-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #a8bdd0; }
        .lp-proof-item strong { color: #f0f4f8; font-weight: 600; }
        .lp-proof-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.07); }

        /* FEATURES */
        .lp-features { padding: 100px 24px; position: relative; z-index: 1; }
        .lp-feat-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 56px;
        }
        .lp-feat-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px; transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .lp-feat-card:hover {
          border-color: rgba(79,163,232,0.3); transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .lp-feat-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(79,163,232,0.4), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .lp-feat-card:hover::before { opacity: 1; }
        .lp-feat-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(79,163,232,0.1); border: 1px solid rgba(79,163,232,0.2);
          color: #4fa3e8; margin-bottom: 18px;
        }
        .lp-feat-card h3 { font-size: 16px; font-weight: 600; color: #f0f4f8; margin-bottom: 8px; letter-spacing: -0.01em; }
        .lp-feat-card p { font-size: 13.5px; color: #5a7a91; line-height: 1.7; }

        /* FX CALLOUT */
        .lp-fx {
          padding: 100px 24px; background: #0d1220; position: relative; z-index: 1;
        }
        .lp-fx-inner {
          max-width: 1000px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
        }
        .lp-fx-mockup {
          background: rgba(13,18,32,0.95); border: 1px solid rgba(255,255,255,0.07); border-radius: 24px;
          padding: 28px; box-shadow: 0 24px 60px rgba(0,0,0,0.5);
          position: relative; overflow: hidden;
        }
        .lp-fx-mockup::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(79,163,232,0.5), transparent);
        }
        .lp-fx-inv-num { font-size: 13px; color: #5a7a91; margin-bottom: 8px; font-weight: 500; }
        .lp-fx-amount { font-size: 32px; font-weight: 600; color: #f0f4f8; letter-spacing: -0.03em; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .lp-fx-amount span { font-size: 16px; font-weight: 400; color: #5a7a91; }
        .lp-fx-locked {
          background: linear-gradient(135deg, rgba(79,163,232,0.12), rgba(79,163,232,0.04));
          border: 1px solid rgba(79,163,232,0.2); border-radius: 12px; padding: 18px;
        }
        .lp-fx-locked-tag { font-size: 11px; font-weight: 700; color: #4fa3e8; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
        .lp-fx-locked-val { font-size: 26px; font-weight: 600; color: #f0f4f8; letter-spacing: -0.02em; margin-bottom: 4px; }
        .lp-fx-locked-rate { font-size: 13px; color: #5a7a91; }

        /* FAQ */
        .lp-faq {
          padding: 100px 24px; background: #0d1220; position: relative; z-index: 1;
        }
        .lp-faq-inner { max-width: 720px; margin: 0 auto; }
        .lp-faq-list { margin-top: 48px; display: flex; flex-direction: column; gap: 12px; }
        .lp-faq-item {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; overflow: hidden; transition: border-color 0.2s;
        }
        .lp-faq-item:hover { border-color: rgba(79,163,232,0.25); }
        .lp-faq-item summary {
          padding: 20px 24px; font-size: 15px; font-weight: 500; color: #f0f4f8;
          cursor: pointer; list-style: none; display: flex; justify-content: space-between;
          align-items: center; gap: 16px; user-select: none;
        }
        .lp-faq-item summary::-webkit-details-marker { display: none; }
        .lp-faq-item summary::after {
          content: '+'; color: #4fa3e8; font-size: 20px; font-weight: 300; flex-shrink: 0; transition: transform 0.2s;
        }
        .lp-faq-item[open] summary::after { transform: rotate(45deg); }
        .lp-faq-item p {
          padding: 0 24px 20px; font-size: 14px; color: #5a7a91; line-height: 1.8; margin: 0;
        }
        .lp-faq-item a { color: #4fa3e8; text-decoration: none; }
        .lp-faq-item a:hover { text-decoration: underline; }

        /* CTA */
        .lp-cta {
          padding: 120px 24px; text-align: center; position: relative; z-index: 1; overflow: hidden;
        }
        .lp-cta-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 700px; height: 500px; pointer-events: none;
          background: radial-gradient(ellipse, rgba(79,163,232,0.14) 0%, transparent 65%);
        }
        .lp-cta-h2 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(36px, 6vw, 72px);
          font-weight: 400; line-height: 1.06; letter-spacing: -0.025em;
          margin-bottom: 20px; max-width: 760px; margin-left: auto; margin-right: auto;
        }
        .lp-cta-h2 em { font-style: italic; color: #7ec8fc; }
        .lp-cta-sub { font-size: 17px; color: #a8bdd0; margin-bottom: 40px; }

        /* FOOTER */
        .lp-footer {
          border-top: 1px solid rgba(255,255,255,0.07); padding: 28px 40px;
          display: flex; justify-content: space-between; align-items: center;
          background: #080c14; position: relative; z-index: 1; flex-wrap: wrap; gap: 12px;
        }
        .lp-footer-logo { font-family: 'Instrument Serif', Georgia, serif; font-size: 17px; color: #a8bdd0; }
        .lp-footer-logo em { color: #4fa3e8; font-style: italic; }
        .lp-footer-copy { font-size: 12px; color: #3d5a6e; }
        .lp-footer-links { display: flex; gap: 20px; }
        .lp-footer-links a { font-size: 12px; color: #5a7a91; text-decoration: none; }
        .lp-footer-links a:hover { color: #a8bdd0; }

        /* SEO FEATURE SECTIONS */
        .lp-feat-section { margin-bottom: 80px; }
        .lp-feat-section:last-child { margin-bottom: 0; }
        .lp-feat-section-header {
          display: flex; align-items: flex-start; gap: 20px;
          margin-bottom: 28px; padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lp-feat-section-icon {
          width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 24px;
          background: rgba(79,163,232,0.1); border: 1px solid rgba(79,163,232,0.2);
        }
        .lp-feat-section-h2 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(24px, 3.5vw, 36px);
          font-weight: 400; line-height: 1.1; letter-spacing: -0.02em;
          color: #f0f4f8; margin: 0 0 8px;
        }
        .lp-feat-section-h2 em { font-style: italic; color: #7ec8fc; }
        .lp-feat-section-desc { font-size: 14px; color: #5a7a91; line-height: 1.7; max-width: 600px; }
        .lp-feat-cards-row {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px;
        }

        /* ECB LINK */
        .lp-ecb-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; color: #4fa3e8; text-decoration: none;
          border-bottom: 1px dashed rgba(79,163,232,0.4);
          transition: border-color 0.2s;
        }
        .lp-ecb-link:hover { border-color: rgba(79,163,232,0.8); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .lp-pain-grid { grid-template-columns: 1fr; }
          .lp-fx-inner { grid-template-columns: 1fr; gap: 40px; }
          .lp-proof-sep { display: none; }
          .lp-stats { gap: 32px; }
          .lp-nav { padding: 0 20px; }
          .lp-footer { flex-direction: column; text-align: center; padding: 24px; }
        }
        @media (max-width: 600px) {
          .lp-hero { padding: 100px 20px 60px; }
          .lp-pain, .lp-features, .lp-fx, .lp-cta, .lp-video, .lp-faq { padding: 72px 20px; }
        }
      `}</style>

      <div className="lp-root">

        {/* NAV */}
        <nav className="lp-nav" aria-label="Main navigation">
          <a href="/" className="lp-logo">Nomad<em>Ledger</em></a>
          <div className="lp-nav-right">
            <Link href="/login" className="lp-btn-ghost">Sign in</Link>
            <Link href="/signup" className="lp-btn-cta">Start free</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="lp-hero" aria-labelledby="hero-heading">
          <div className="lp-hero-glow" />
          <p className="lp-eyebrow">
            <span className="lp-eyebrow-dot" />
            Invoicing software for digital nomads
          </p>

          {/* H1 — Primary keyword: "Invoicing Software Built for Digital Nomads" */}
          <h1 id="hero-heading" className="lp-h1">
            The <span className="accent">Invoicing Software</span>{' '}
            Built for{' '}<span className="dim">Digital Nomads</span>
          </h1>

          <p className="lp-sub">
            Bill clients in GBP, EUR, USD or INR. Your exchange rate is locked at the invoice send-date — permanently. No recalculations, no surprises, no more opening 3 tabs to figure out what you actually earned this month.
          </p>
          <div className="lp-hero-btns">
            <Link href="/signup" className="lp-btn-primary" id="hero-cta-signup">
              Get started free — no card needed
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <a href="#features" className="lp-btn-outline" id="hero-see-how">See how it works</a>
          </div>

          {/* Live Dashboard Preview Card */}
          <div className="lp-card-wrap">
            <div className="lp-card" role="img" aria-label="Live dashboard showing GBP EUR USD invoices converted to INR home currency for digital nomad using NomadLedger invoicing software">
              <div className="lp-card-pill"><span className="lp-pill-dot" />Live Dashboard</div>
              <div className="lp-inv-row">
                <span className="lp-inv-client">Acem Corp</span>
                <div className="lp-inv-right">
                  <div className="lp-inv-amount">£2,500</div>
                  <div className="lp-inv-home">= ₹3,31,050</div>
                </div>
              </div>
              <div className="lp-inv-row">
                <span className="lp-inv-client">Infotech GmbH</span>
                <div className="lp-inv-right">
                  <div className="lp-inv-amount">€3,000</div>
                  <div className="lp-inv-home">= ₹2,76,300</div>
                </div>
              </div>
              <div className="lp-inv-row">
                <span className="lp-inv-client">ADM Inc.</span>
                <div className="lp-inv-right">
                  <div className="lp-inv-amount">$2,500</div>
                  <div className="lp-inv-home">= ₹2,15,500</div>
                </div>
              </div>
              <div className="lp-card-total">
                <div>
                  <div className="lp-total-label">Total (Home INR)</div>
                  <div className="lp-total-num">₹8,22,850</div>
                </div>
                <div>
                  <div className="lp-tax-label">Est. Tax</div>
                  <div className="lp-tax-num">₹1,23,400</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lp-stats">
            <div className="lp-stat"><div className="lp-stat-num">$1,300B</div><div className="lp-stat-lbl">Nomad tools market</div></div>
            <div className="lp-stat"><div className="lp-stat-num">35M</div><div className="lp-stat-lbl">Digital nomads worldwide</div></div>
            <div className="lp-stat"><div className="lp-stat-num">$19</div><div className="lp-stat-lbl">Per month, cancel anytime</div></div>
          </div>
        </section>

        {/* TICKER */}
        <div className="lp-ticker" aria-hidden="true">
          <div className="lp-ticker-track">
            {['Invoicing software for digital nomads','FX rate locked at invoice date','Multi-currency invoice app','12 tax jurisdictions','Razorpay payment links','GBP · EUR · USD · INR · SGD','Free freelancer tax calculator','PDF invoices in one click',
              'Invoicing software for digital nomads','FX rate locked at invoice date','Multi-currency invoice app','12 tax jurisdictions','Razorpay payment links','GBP · EUR · USD · INR · SGD','Free freelancer tax calculator','PDF invoices in one click'].map((t, i) => (
              <span key={i} className="lp-ticker-item"><span className="lp-ticker-dot" />{t}</span>
            ))}
          </div>
        </div>

        {/* PAIN — H2 with primary keyword */}
        <section className="lp-pain" aria-labelledby="pain-heading">
          <div className="lp-section-inner">
            <div className="lp-label">The Problem</div>
            {/* H2: Keyword in Heading 2 ✅ */}
            <h2 id="pain-heading" className="lp-h2">Why Every Invoicing Tool <span className="dim">Breaks</span><br />When You Have Clients<br />in <span className="blue">4 Currencies.</span></h2>
            <div className="lp-pain-grid">
              {[
                { icon: '💸', title: 'Rate recalculation kills your books', body: 'QuickBooks, Wave, and FreshBooks recalculate exchange rates every time you open the app. An invoice you raised in January for £2,500 shows a different INR value in March — even though your client paid weeks ago. That is not accounting. That is a broken invoicing tool.', quote: '"My income looks different every time I open my accounting app."' },
                { icon: '🌀', title: 'Moving countries breaks your tax year', body: 'No multi-currency finance tool handles mid-year country changes for digital nomads. Move from India to Portugal in May and your tax jurisdiction shifts — but your tool still calculates using January\'s rules. NomadLedger updates your progressive tax bracket live when you change your home country in Settings.', quote: '"I paid taxes in two countries on the same income. Nobody warned me."' },
                { icon: '📉', title: 'No tool shows you one total', body: '£2,500 from a UK client. €3,000 from Germany. $2,500 from the US. What did you actually earn this month? No existing invoicing software for freelancers shows you a single home-currency total — until now.', quote: '"I open 3 tabs every payday just to figure out what I made."' },
              ].map(c => (
                <div key={c.title} className="lp-pain-card">
                  <div className="lp-pain-icon">{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                  <blockquote>{c.quote}</blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROOF */}
        <div className="lp-proof">
          <div className="lp-proof-inner">
            <div className="lp-proof-item">🌍 <strong>35M+</strong> digital nomads globally</div>
            <div className="lp-proof-sep" />
            <div className="lp-proof-item">💼 <strong>54%</strong> of freelancers face delayed payments</div>
            <div className="lp-proof-sep" />
            <div className="lp-proof-item">📊 <strong>$2,500+</strong> avg overdue invoice value</div>
            <div className="lp-proof-sep" />
            <div className="lp-proof-item">🏦 Cross-border fees cost <strong>2–5%</strong> per transfer</div>
          </div>
        </div>

        {/* FEATURES — H2 with "Multi-Currency Invoice App" keyword */}
        <section className="lp-features" id="features" aria-labelledby="features-heading">
          <div className="lp-section-inner">
            <div className="lp-label">Everything you need</div>

            {/* H2: "The Only Multi-Currency Invoice App That Locks Your Exchange Rate Forever" */}
            <h2 id="features-heading" className="lp-h2" style={{ marginBottom: 56 }}>
              The Only <span className="blue">Multi-Currency Invoice App</span><br />That Locks Your Exchange Rate Forever.
            </h2>

            {/* SEO FEATURE SECTION 1 */}
            <div className="lp-feat-section">
              <div className="lp-feat-section-header">
                <div className="lp-feat-section-icon">💱</div>
                <div>
                  <h3 className="lp-feat-section-h2">Invoice in <em>GBP, EUR, USD</em> — See Everything in INR</h3>
                  <p className="lp-feat-section-desc">Every invoice locks the exchange rate at the moment it's sent using <a href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html" target="_blank" rel="noopener noreferrer" className="lp-ecb-link">European Central Bank historical rates ↗</a> — no manual calculations, no surprise fluctuations in your annual report.</p>
                </div>
              </div>
              <div className="lp-feat-cards-row">
                {[
                  { icon: '🔒', title: 'Rate locked at invoice date', desc: 'Send invoices in USD, EUR, GBP. The ECB rate is captured at creation and never recalculated — your books stay accurate forever.' },
                  { icon: '📊', title: 'Real-time conversion display', desc: 'See live home-currency equivalents for every client balance — updated each session from ECB historical rates.' },
                  { icon: '📈', title: 'P&L in your home currency', desc: 'All income, from every currency, normalized into your home currency for quarterly and annual reporting.' },
                ].map(f => (
                  <div key={f.title} className="lp-feat-card">
                    <div className="lp-feat-icon" style={{ fontSize: 20 }}>{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO FEATURE SECTION 2 — Freelancer Tax Calculator */}
            <div className="lp-feat-section">
              <div className="lp-feat-section-header">
                <div className="lp-feat-section-icon">🧮</div>
                <div>
                  <h3 className="lp-feat-section-h2"><em>Freelancer Tax Calculator</em> for 12 Countries — Updated Live</h3>
                  <p className="lp-feat-section-desc">Progressive tax bracket breakdown for India, UK, US, Germany, Portugal, Australia, Canada and 5 more countries. As you add invoices and expenses, your estimated tax liability updates in real time. See your <Link href="/tax-calculator" className="lp-ecb-link">free tax calculator →</Link></p>
                </div>
              </div>
              <div className="lp-feat-cards-row">
                {[
                  { icon: '🏦', title: 'Progressive bracket breakdown', desc: 'Real bracket-by-bracket tax calculation for India, UK, US, Germany, and 8 more countries.' },
                  { icon: '📋', title: 'Deductible expense tracking', desc: 'Log business expenses in any currency. AI auto-categorizes them. Deductibles reduce your taxable income automatically.' },
                  { icon: '⏰', title: 'Quarterly advance tax alerts', desc: 'Know your advance tax liability before the deadline — broken down by quarter, no accountant required.' },
                ].map(f => (
                  <div key={f.title} className="lp-feat-card">
                    <div className="lp-feat-icon" style={{ fontSize: 20 }}>{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO FEATURE SECTION 3 — Razorpay + Clients */}
            <div className="lp-feat-section">
              <div className="lp-feat-section-header">
                <div className="lp-feat-section-icon">🌍</div>
                <div>
                  <h3 className="lp-feat-section-h2">Manage <em>6–20 International Clients</em> in One Dashboard</h3>
                  <p className="lp-feat-section-desc">Stop juggling spreadsheets and browser tabs. Every client, invoice, and currency lives in a single, beautiful workspace. Razorpay payment links on every invoice — clients pay by UPI, cards, or net banking.</p>
                </div>
              </div>
              <div className="lp-feat-cards-row">
                {[
                  { icon: '⚡', title: 'Razorpay payment links on every invoice', desc: 'Clients pay instantly via UPI, cards, or net banking — the only invoicing software for Indian freelancers with built-in Razorpay integration.' },
                  { icon: '📄', title: 'Professional PDF invoices', desc: 'Beautiful PDF invoices with rate, currency breakdown, and payment link baked in — one click, every time.' },
                  { icon: '👥', title: 'Multi-client overview', desc: 'Total earned per client, outstanding balances, and overdue alerts — visible at a glance across 6, 10, or 20 clients.' },
                ].map(f => (
                  <div key={f.title} className="lp-feat-card">
                    <div className="lp-feat-icon" style={{ fontSize: 20 }}>{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* FX CALLOUT — H2 with "How FX Rate Locking Works" keyword */}
        <section className="lp-fx" aria-labelledby="fx-heading">
          <div className="lp-fx-inner">
            <div>
              <div className="lp-label">Core technology</div>
              {/* H2: "How Our FX Rate Locking Works" */}
              <h2 id="fx-heading" className="lp-h2" style={{ marginBottom: 20 }}>
                How Our FX Rate Locking Works —<br /><span className="blue">Invoice Conversion Logic</span><br />Explained.
              </h2>
              <p style={{ fontSize: 16, color: '#a8bdd0', lineHeight: 1.8, marginBottom: 20 }}>
                Most multi-currency invoicing tools recalculate exchange rates every time you open an invoice. NomadLedger does the opposite.
              </p>
              <p style={{ fontSize: 16, color: '#a8bdd0', lineHeight: 1.8, marginBottom: 24 }}>
                When you send an invoice for $3,000 on a day when 1 USD = ₹84.00, we fetch that rate from the{' '}
                <a
                  href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lp-ecb-link"
                >
                  European Central Bank&apos;s historical data ↗
                </a>{' '}
                and write it to a permanent column on your invoice. That ₹2,52,000 is locked forever.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Rate captured at invoice creation — never recalculated after',
                  'Full audit trail: rate date, from/to currency, locked home-currency value',
                  'Shown on every invoice line, the invoice list, and the dashboard total',
                  'Free ECB historical data — no API key, no cost to you',
                  'Works for GBP, EUR, USD, INR, SGD and 150+ other currencies',
                ].map(pt => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#a8bdd0', lineHeight: 1.6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4fa3e8', flexShrink: 0, marginTop: 7 }} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="lp-fx-mockup"
              role="img"
              aria-label="Invoice INV-0024 showing USD to INR exchange rate locked at invoice date for freelancer billing international clients using NomadLedger multi-currency invoice app"
            >
              <div className="lp-fx-inv-num">Invoice INV-0024</div>
              <div className="lp-fx-amount">$3,000.00 <span>USD</span></div>
              <div className="lp-fx-locked">
                <div className="lp-fx-locked-tag">Rate Locked — Send-Date FX</div>
                <div className="lp-fx-locked-val">₹2,52,000.00</div>
                <div className="lp-fx-locked-rate">1 USD = ₹84.00 · Locked 1 Apr 2026 · Will not change</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ — with FAQ schema keywords ✅ */}
        <section className="lp-faq" aria-labelledby="faq-heading">
          <div className="lp-faq-inner">
            <div className="lp-label">FAQ</div>
            <h2 id="faq-heading" className="lp-h2" style={{ fontSize: 'clamp(30px, 4vw, 52px)' }}>
              Frequently Asked Questions About<br /><span className="blue">Multi-Currency Invoicing</span> for Freelancers
            </h2>
            <div className="lp-faq-list">
              {[
                {
                  q: 'What is the best invoicing software for digital nomads in India?',
                  a: (<>NomadLedger is built specifically for Indian digital nomads billing international clients. It locks your exchange rate at invoice creation using ECB historical data, calculates your Indian income tax estimate live, and integrates Razorpay payment links on every invoice — so your clients can pay by UPI or card directly from the PDF. <Link href="/signup" className="lp-ecb-link">Start free →</Link></>),
                },
                {
                  q: 'How do I invoice international clients in GBP, EUR, or USD from India?',
                  a: 'Create a client profile in NomadLedger, set their billing currency (GBP, EUR, USD, or any other), and raise an invoice. The app fetches the exchange rate for that date from the ECB, converts the amount to INR, and locks both values permanently. Your client receives a professional PDF with a Razorpay payment link.',
                },
                {
                  q: 'Does NomadLedger work for freelancers outside India?',
                  a: 'Yes. NomadLedger supports home currencies for 12 countries including India (INR), UK (GBP), US (USD), Germany (EUR), Portugal (EUR), Australia (AUD), Canada (CAD), Singapore (SGD), and more. If you move countries mid-year, simply update your home country in Settings — your historical invoices keep their original locked rates.',
                },
                {
                  q: 'What is send-date FX locking and why does it matter for my taxes?',
                  a: 'Send-date FX locking means your invoice\'s home-currency value is calculated using the exchange rate on the day you created the invoice — and never changes after that. This is the method required by India\'s Income Tax Act, the IRS (Publication 54), and HMRC for reporting foreign income. It gives you a stable, auditable income figure for tax filing.',
                },
                {
                  q: 'Is there a free freelancer tax calculator for Indian digital nomads?',
                  a: (<>NomadLedger includes a free progressive tax bracket calculator for India and 11 other countries. As you add invoices and log deductible expenses, your estimated tax liability updates live. <Link href="/tax-calculator" className="lp-ecb-link">Try the free tax calculator →</Link></>),
                },
              ].map((item, i) => (
                <details key={i} className="lp-faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — Updated with keyword-rich copy */}
        <section className="lp-cta" aria-labelledby="cta-heading">
          <div className="lp-cta-glow" />
          <h2 id="cta-heading" className="lp-cta-h2">
            The Invoicing Software Digital Nomads<br />Actually <em>Built Their Business On.</em>
          </h2>
          <p className="lp-cta-sub">Join freelancers in 40+ countries who finally know exactly what they earn — in their home currency, locked at the rate it was earned.</p>
          <Link href="/signup" className="lp-btn-primary" style={{ fontSize: 16, padding: '16px 44px' }} id="cta-final-signup">
            Start free — no credit card needed →
          </Link>
        </section>

        {/* FREE TOOLS STRIP */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, color: '#3d5a6e', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 14 }}>Free tools for freelancers</p>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/tax-calculator" style={{ color: '#4fa3e8', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Freelancer Tax Calculator</Link>
            <Link href="/fx-history" style={{ color: '#4fa3e8', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>FX Rate History</Link>
            <Link href="/invoice-converter" style={{ color: '#4fa3e8', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Invoice Currency Converter</Link>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="lp-footer-logo">Nomad<em>Ledger</em></div>
          <div className="lp-footer-links">
            <Link href="/tax-calculator">Tax Calculator</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/signup">Start Free</Link>
          </div>
          <div className="lp-footer-copy">© 2026 NomadLedger · Built for nomads, by nomads.</div>
        </footer>

      </div>
    </>
  )
}
