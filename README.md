# PRIME AI — Multi-Tenant Enterprise OS

PRIME AI is a high-performance executive operating system featuring Autonomous Revenue Radar, AI Digital Twin, Executive Email Triage, 9:00 AM Strategic Briefings, and Multi-Tenant SaaS billing.

---

## 🚀 Quick Deploy to Vercel

### Method 1: Deploy with Git (Recommended)
1. Extract this ZIP archive and push the contents to a new GitHub / GitLab repository.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Import your repository.
4. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build` (or `npm run build`)
   - **Output Directory**: `dist`
5. **Environment Variables**:
   Under the "Environment Variables" section, copy the required keys from `.env.example`:
   - `VITE_SUPABASE_URL` = Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key
   - `GEMINI_API_KEY` = Your Gemini API Key (if running AI features server-side)
   - `STRIPE_SECRET_KEY` = Your Stripe Secret Key (optional for payments)
6. Click **Deploy**!

### Method 2: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```
Follow the interactive prompts (select Vite, output `dist`, default settings).

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm / pnpm / bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase credentials or Gemini API key.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
├── public/                 # Static assets & public downloads
├── src/
│   ├── components/         # Modular UI components (Radar, Twin, Inbox, etc.)
│   ├── context/            # AuthContext, NotificationContext, etc.
│   ├── lib/                # Supabase, Firebase, utility clients
│   ├── types.ts            # Core TypeScript interfaces
│   ├── App.tsx             # Main application orchestrator
│   └── main.tsx            # React 19 entry point
├── server.ts               # Node/Express API proxy & subscription engine
├── vercel.json             # Vercel SPA routing & build configuration
├── vite.config.ts          # Vite build & Tailwind 4 setup
├── package.json            # Project dependencies and scripts
└── .env.example            # Environment variables template & SQL schema
```

---

## 🔒 Multi-Tenant Database
Run the complete SQL schema provided inside `.env.example` in your Supabase SQL Editor to enable all tables (`companies`, `users`, `subscriptions`, `deals`, `inbox`, `briefings`) with Row Level Security (RLS).
