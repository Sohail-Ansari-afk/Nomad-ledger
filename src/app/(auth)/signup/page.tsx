'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // We pass full_name in metadata so the DB trigger can pick it up
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  if (success) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: 48, height: 48, background: 'var(--teal-light)', color: 'var(--teal-dk)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="section-heading" style={{ margin: '0 0 12px' }}>Check your email</h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 13, lineHeight: 1.6 }}>
            We've sent a verification link to <strong style={{ color: 'var(--ink)' }}>{email}</strong>.<br />
            Click the link to finish setting up your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header pb-2">
        <h2 className="section-heading" style={{ margin: 0 }}>Create your account</h2>
      </div>
      <div className="card-body">
        {error && (
          <div className="info-box mb-4" style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid currentColor', borderRadius: 'var(--r-sm)', padding: '12px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup}>
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>
          <div className="form-field">
            <label className="form-label">Email address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          <div style={{ padding: '0 12px', fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>Or sign up with</div>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
        </div>

        <button 
          onClick={handleGoogleSignup} 
          className="btn" 
          style={{ width: '100%', justifyContent: 'center', background: 'var(--surface)' }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </div>
      <div className="card-header" style={{ justifyContent: 'center', background: 'var(--surface-2)', borderBottom: 'none', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
