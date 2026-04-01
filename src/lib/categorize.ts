import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const EXPENSE_CATEGORIES = [
  'Software subscription',
  'Hardware & equipment',
  'Travel & transport',
  'Accommodation',
  'Coworking & office',
  'Professional services',
  'Marketing & advertising',
  'Education & courses',
  'Meals (business)',
  'Insurance',
  'Communication',
  'Other',
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

export interface CategoryResult {
  category:   ExpenseCategory
  deductible: boolean
  confidence: 'high' | 'medium' | 'low'
  method:     'rule' | 'ai'
}

// ─── Rule-based first pass (free, instant) ────────────────────────────────
const RULES: { keywords: string[]; category: ExpenseCategory; deductible: boolean }[] = [
  {
    keywords: ['adobe', 'figma', 'notion', 'slack', 'zoom', 'github', 'gitlab',
               'digitalocean', 'vercel', 'netlify', 'aws', 'gcp', 'azure',
               'subscription', 'saas', 'software', 'license', 'plugin',
               'netflix', 'spotify', 'loom', 'canva', 'linear', 'jira', 'sentry',
               'supabase', 'cloudflare', 'namecheap', 'godaddy', 'domain', 'hostinger'],
    category: 'Software subscription', deductible: true,
  },
  {
    keywords: ['laptop', 'macbook', 'imac', 'monitor', 'keyboard', 'mouse',
               'ipad', 'tablet', 'webcam', 'headphone', 'microphone', 'speaker',
               'hard drive', 'ssd', 'ram', 'cable', 'adapter', 'dock', 'computer'],
    category: 'Hardware & equipment', deductible: true,
  },
  {
    keywords: ['uber', 'ola', 'rapido', 'taxi', 'lyft', 'flight', 'airfare',
               'airline', 'train', 'bus', 'metro', 'fuel', 'petrol', 'diesel',
               'parking', 'toll', 'ferry', 'indigo', 'air india', 'vistara',
               'spicejet', 'makemytrip', 'goibibo', 'irctc'],
    category: 'Travel & transport', deductible: true,
  },
  {
    keywords: ['airbnb', 'hotel', 'hostel', 'resort', 'booking.com', 'agoda',
               'oyo', 'treebo', 'fabhotel', 'rent', 'accommodation', 'lodging'],
    category: 'Accommodation', deductible: true,
  },
  {
    keywords: ['coworking', 'wework', 'regus', 'spaces', 'co-work', 'cowork',
               'office space', 'desk', 'meeting room', 'serviced office'],
    category: 'Coworking & office', deductible: true,
  },
  {
    keywords: ['lawyer', 'chartered accountant', 'ca ', 'accountant', 'consultant',
               'legal', 'attorney', 'cpa', 'bookkeeper', 'auditor', 'professional fee'],
    category: 'Professional services', deductible: true,
  },
  {
    keywords: ['google ads', 'facebook ads', 'meta ads', 'instagram ads',
               'linkedin ads', 'twitter ads', 'marketing', 'advertising',
               'seo', 'social media', 'mailchimp', 'convertkit'],
    category: 'Marketing & advertising', deductible: true,
  },
  {
    keywords: ['udemy', 'coursera', 'skillshare', 'pluralsight', 'linkedin learning',
               'book', 'ebook', 'course', 'training', 'workshop', 'conference',
               'bootcamp', 'certification', 'tutorial', 'masterclass'],
    category: 'Education & courses', deductible: true,
  },
  {
    keywords: ['restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast',
               'meal', 'food', 'zomato', 'swiggy', 'uber eats', 'client dinner'],
    category: 'Meals (business)', deductible: true,
  },
  {
    keywords: ['insurance', 'health insurance', 'life insurance', 'policy', 'mediclaim'],
    category: 'Insurance', deductible: true,
  },
  {
    keywords: ['phone', 'mobile', 'internet', 'broadband', 'wifi', 'data plan',
               'jio', 'airtel', 'vodafone', 'bsnl', 'hotspot', 'sim'],
    category: 'Communication', deductible: true,
  },
]

function ruleBasedCategory(description: string): CategoryResult | null {
  const lower = description.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return {
        category:   rule.category,
        deductible: rule.deductible,
        confidence: 'high',
        method:     'rule',
      }
    }
  }
  return null
}

async function aiCategory(description: string): Promise<CategoryResult> {
  const prompt = `Categorize this freelancer business expense.
Expense: "${description}"

Reply ONLY with valid JSON, no markdown:
{"category": "<category>", "deductible": true/false, "confidence": "high/medium/low"}

Valid categories: ${EXPENSE_CATEGORIES.join(', ')}`

  try {
    const response = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      max_tokens:  80,
      temperature: 0,
      messages:    [{ role: 'user', content: prompt }],
    })

    const text   = response.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(text)

    return {
      category:   parsed.category   || 'Other',
      deductible: parsed.deductible !== false,
      confidence: parsed.confidence || 'medium',
      method:     'ai',
    }
  } catch {
    return { category: 'Other', deductible: true, confidence: 'low', method: 'ai' }
  }
}

// ─── Main export ──────────────────────────────────────────────────────────
export async function categorizeExpense(description: string): Promise<CategoryResult> {
  const ruleResult = ruleBasedCategory(description)
  if (ruleResult) return ruleResult
  return aiCategory(description)
}
