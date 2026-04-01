// ─── Currency & Plan ──────────────────────────────────────────────────────
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD' | 'AED'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export type Plan = 'free' | 'pro'

// ─── Profile ──────────────────────────────────────────────────────────────
export interface Profile {
  id:             string
  full_name:      string | null
  home_country:   string
  home_currency:  Currency
  tax_year_start: number
  plan:           Plan
  razorpay_sub_id: string | null
  onboarded:      boolean
  created_at:     string
  updated_at:     string
}

// ─── Client ───────────────────────────────────────────────────────────────
export interface Client {
  id:           string
  user_id:      string
  name:         string
  email:        string | null
  country:      string | null
  currency:     Currency
  default_rate: number | null
  notes:        string | null
  created_at:   string
}

// ─── Invoice ──────────────────────────────────────────────────────────────
export interface InvoiceItem {
  id:          string
  invoice_id:  string
  description: string
  quantity:    number
  unit_price:  number
  amount:      number   // generated column
  position:    number
}

export interface Invoice {
  id:                        string
  user_id:                   string
  client_id:                 string
  invoice_number:            string
  invoice_date:              string
  due_date:                  string | null
  status:                    InvoiceStatus
  invoice_currency:          Currency
  invoice_amount:            number
  home_currency:             Currency
  fx_rate_locked:            number | null
  fx_rate_date:              string | null
  home_amount:               number | null
  razorpay_payment_link_id:  string | null
  razorpay_payment_link_url: string | null
  paid_at:                   string | null
  notes:                     string | null
  created_at:                string
  updated_at:                string
  // Joined
  client?:  Client
  items?:   InvoiceItem[]
}

// ─── Expense ──────────────────────────────────────────────────────────────
export interface Expense {
  id:               string
  user_id:          string
  date:             string
  description:      string
  category:         string
  expense_currency: Currency
  expense_amount:   number
  home_currency:    Currency
  fx_rate_locked:   number | null
  fx_rate_date:     string | null
  home_amount:      number | null
  deductible:       boolean
  receipt_url:      string | null
  notes:            string | null
  created_at:       string
}

// ─── Tax engine ───────────────────────────────────────────────────────────
export interface TaxBracket {
  max:  number
  rate: number
}

export interface CountryTaxRules {
  selfEmploymentRate: number
  brackets:           TaxBracket[]
  currency:           Currency
  quarterlyPayments:  boolean
  quarterDates?:      string[]
}

export interface TaxEstimate {
  grossIncome:   number
  deductions:    number
  taxableIncome: number
  tax:           number
  effectiveRate: number
  currency:      Currency
  brackets:      { slab: string; rate: number; tax: number }[]
}

// ─── FX ───────────────────────────────────────────────────────────────────
export interface FxResult {
  rate:   number
  date:   string
  source: 'cache' | 'api'
}

// ─── Payments ─────────────────────────────────────────────────────────────
export interface Payment {
  id:                   string
  user_id:              string
  invoice_id:           string | null
  razorpay_payment_id:  string
  razorpay_event:       string
  amount_paise:         number
  currency:             string
  status:               string
  created_at:           string
}

// ─── Dashboard ────────────────────────────────────────────────────────────
export interface DashboardData {
  ytdIncome:       number
  outstandingTotal: number
  taxSetAside:     number
  netProfit:       number
  totalDeductions: number
  outstandingInvoices: Invoice[]
  currency:        Currency
}
