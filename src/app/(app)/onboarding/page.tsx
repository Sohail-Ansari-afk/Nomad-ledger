'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SUPPORTED_COUNTRIES, COUNTRY_NAMES, CURRENCY_FOR_COUNTRY } from '@/lib/tax/rules'
import type { Currency } from '@/types'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 State
  const [homeCountry, setHomeCountry] = useState('IN')
  const [taxYearStart, setTaxYearStart] = useState(4) // April by default for India

  // Step 2 State
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientCurrency, setClientCurrency] = useState<Currency>('USD')

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      // Save everything
      setLoading(true)
      setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user found')

        const homeCurrency = CURRENCY_FOR_COUNTRY[homeCountry] || 'USD'

        // 1. Update Profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            home_country: homeCountry,
            home_currency: homeCurrency,
            tax_year_start: taxYearStart,
            onboarded: true,
          })
          .eq('id', user.id)

        if (profileError) throw profileError

        // 2. Insert Client if name provided
        if (clientName) {
          const { error: clientError } = await supabase
            .from('clients')
            .insert({
              user_id: user.id,
              name: clientName,
              email: clientEmail || null,
              currency: clientCurrency,
            })
          
          if (clientError) throw clientError
        }

        router.push('/dashboard')
        router.refresh()
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '60px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="section-heading">Welcome to NomadLedger</h1>
        <p className="section-body">Let's set up your account so you can start invoicing.</p>
        
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: step === 1 ? 'var(--teal)' : 'var(--border)' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: step === 2 ? 'var(--teal)' : 'var(--border)' }} />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {error && (
             <div className="info-box info-box-red mb-4" style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid currentColor', borderRadius: 'var(--r-sm)', padding: '12px' }}>
             {error}
           </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>1. Your Base Country</h3>
              
              <div className="form-field">
                <label className="form-label">Where do you pay taxes?</label>
                <select 
                  className="form-select"
                  value={homeCountry}
                  onChange={(e) => setHomeCountry(e.target.value)}
                >
                  <option value="">Select country...</option>
                  {SUPPORTED_COUNTRIES.map(code => (
                    <option key={code} value={code}>{COUNTRY_NAMES[code]}</option>
                  ))}
                </select>
                <p className="form-hint">Used for tax estimates. Your base currency will be set to {CURRENCY_FOR_COUNTRY[homeCountry] || '...'}.</p>
              </div>

              <div className="form-field mt-4">
                <label className="form-label">Tax Year Starts In</label>
                <select 
                  className="form-select"
                  value={taxYearStart}
                  onChange={(e) => setTaxYearStart(Number(e.target.value))}
                >
                  <option value={1}>January</option>
                  <option value={4}>April (India/UK)</option>
                  <option value={7}>July (Australia)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                <button className="btn btn-primary" onClick={handleNext} disabled={!homeCountry}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>2. Add Your First Client</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>You can always add more clients later or skip this step.</p>
              
              <div className="form-field">
                <label className="form-label">Client Company Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Acme Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Client Email (Optional)</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="billing@acme.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Invoice Currency</label>
                  <select 
                    className="form-select"
                    value={clientCurrency}
                    onChange={(e) => setClientCurrency(e.target.value as Currency)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="SGD">SGD ($)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                <button className="btn" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn btn-primary" onClick={handleNext} disabled={loading}>
                  {loading ? 'Setting up...' : 'Finish Setup'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
