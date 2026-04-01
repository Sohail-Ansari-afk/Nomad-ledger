import { TAX_RULES } from './rules'
import type { TaxEstimate, Currency } from '@/types'

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateTax(
  ytdIncomeHome: number,
  homeCountry: string,
  totalDeductions: number
): TaxEstimate {
  const rules = TAX_RULES[homeCountry]
  if (!rules) throw new Error(`No tax rules for country: ${homeCountry}`)

  const grossIncome = ytdIncomeHome

  // Self-employment tax deduction (US: 50% of SE tax is deductible)
  const seDeduction = grossIncome * (rules.selfEmploymentRate * 0.5)
  const taxableIncome = Math.max(0, grossIncome - totalDeductions - seDeduction)

  // SE tax (e.g. US Social Security + Medicare)
  const seTax = grossIncome * rules.selfEmploymentRate * 0.5

  // Calculate income tax bracket by bracket
  let incomeTax = 0
  const bracketBreakdown: TaxEstimate['brackets'] = []
  let previousMax = 0

  for (const bracket of rules.brackets) {
    if (taxableIncome <= previousMax) break

    const bracketMin    = previousMax
    const bracketMax    = Math.min(taxableIncome, bracket.max)
    const bracketIncome = bracketMax - bracketMin
    const bracketTax    = bracketIncome * bracket.rate

    incomeTax += bracketTax

    const slabDisplay =
      bracket.max === Infinity
        ? `${formatCurrency(bracketMin, rules.currency)}+`
        : `${formatCurrency(bracketMin, rules.currency)} – ${formatCurrency(bracketMax, rules.currency)}`

    bracketBreakdown.push({
      slab: slabDisplay,
      rate: bracket.rate,
      tax:  Math.round(bracketTax),
    })

    previousMax = bracket.max
  }

  const totalTax     = incomeTax + seTax
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0

  return {
    grossIncome:   Math.round(grossIncome),
    deductions:    Math.round(totalDeductions + seDeduction),
    taxableIncome: Math.round(taxableIncome),
    tax:           Math.round(totalTax),
    effectiveRate: Math.round(effectiveRate * 10000) / 100,
    currency:      rules.currency as Currency,
    brackets:      bracketBreakdown.filter(b => b.tax > 0),
  }
}
