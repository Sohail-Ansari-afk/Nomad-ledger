# NomadLedger

A powerful, minimalistic financial dashboard designed explicitly for freelancers and digital nomads. Track your income, log your expenses, link expenses directly to invoices, and generate beautiful payable invoices globally.

## ✨ Features

- **Multi-Currency Invoicing**: Create invoices in any currency while dynamically converting and tracking the total back to your native "Home Currency" using historical exchange rates.
- **Smart Expense Tracking**: Log expenses seamlessly. Mark expenses as tax-deductible and keep your bottom line clear.
- **Cross-Linking System**: Attach recurring expenses directly to specific invoices to track raw profitability and operating margins per project.
- **Full CRUD Capabilities**: Create, Read, Update, and Delete both invoices and expenses with a robust backend interface.
- **Razorpay Integration**: Instantly generate live payment links for clients to pay invoices securely online.
- **PDF Generation**: One-click, beautifully styled printable PDF outputs for your invoices to send as professional attachments.
- **Premium UI/UX**: Built with custom Native CSS utilizing modern design principles like glassmorphism and real-time form validation.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with strict Row Level Security)
- **Styling**: Vanilla CSS for maximum performance and granular aesthetic control
- **Payments**: Razorpay API

## 🚀 Getting Started

First, clone the repository and install dependencies:

```bash
git clone https://github.com/Sohail-Ansari-afk/Nomad-ledger.git
cd Nomad-ledger/nomadledger-app
npm install
```

### Environment Variables

Create a `.env.local` file in the `<project-root>/nomadledger-app` directory and add the following keys. You will need to spin up a Supabase project and grab sandbox keys from a Razorpay account:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# For live payment link generation
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Optional: For AI expense categorization
OPENCHAI_API_KEY=your-openchai-key
```

### Start the Server

Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

## 🗄️ Database Architecture

NomadLedger relies on core tables mapped securely via Supabase RLS (Row Level Security):
1. `profiles`: Global configurations (Home Currency tracking).
2. `clients`: User-specific CRM handling address and contact information.
3. `invoices` & `invoice_items`: Primary relationship for handling complex, multi-item billing docs.
4. `expenses` & `invoice_expenses`: Tracks individual expenses and their Many-to-Many relationship matrix with specific invoices natively.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
