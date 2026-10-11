# Royal Hair Wigs — Professional Invoice Maker

> Production-ready, pixel-perfect Invoice Maker web application for **Royal Hair Wigs — Processed Hair & Wig Manufacturer**, meticulously engineered to recreate and enhance the official company invoice format (Reference: Invoice #42646).

---

## 🌟 Key Features

### 1. Pixel-Perfect Reference Recreation
- **Official Brand Crest & Logo**: Centered header logo with the exact brand typography and high-resolution vector scaling.
- **Subtle Security Watermark**: Low-opacity (8%) centered background watermark of the Royal Hair Wigs crest for authenticity.
- **Standard A4 Layout**: Designed specifically for A4 portrait export and printing with precise millimeter margins.
- **4-Column Meta Table**: `From` (Md Boshirul Islam) | `Tittle` (Managing Director) | `Payment Currency` (USD) | `Due Date` (Within 20 days).
- **Interactive Product Table**: Recreates original columns: `Product Name`, `Hair Colour`, `Base Size`, `Quantity`, `Unit Price`, `Total Price`.
- **Dynamic Cost Summary**: Auto-calculating `Product Cost`, `Shipping Cost`, any number of `Extra Charges`, and `Total Cost`.

### 2. Live Interactive Editor & Real-Time Preview
- **Two-Column Layout**: Left-hand side tabbed editor paired with a live zoomable A4 invoice preview on the right that recalculates instantly on every keystroke.
- **Quantity & Price Stepper**: Supports direct numeric input as well as quick `+` / `-` increment buttons.
- **Customizable Columns**: Reorder columns, rename headers, and toggle optional custom columns.
- **Dynamic Extra Costs**: Click **"Add Extra Cost"** to add any number of charges (e.g. *Packaging Cost: $15*, *Insurance*, *Handling Fee*).
- **Multi-Currency Engine**: Full support for 13 global currencies with native currency symbols and formatting:
  `USD ($)`, `BDT (৳)`, `INR (₹)`, `EUR (€)`, `GBP (£)`, `AED (د.إ)`, `SAR (ر.س)`, `CAD (C$)`, `AUD (A$)`, `PKR (₨)`, `JPY (¥)`, `CNY (¥)`, `LKR (Rs)`.

### 3. High-Fidelity PDF & Print System
- **Crisp Vector & Raster Export**: Utilizes `jspdf` and `html2canvas` configured at 2x device pixel ratio for sharp text and borders.
- **Standard Naming Convention**: Generates clean filenames: `Royal-Hair-Wigs-Invoice-{number}.pdf` (e.g. `Royal-Hair-Wigs-Invoice-42647.pdf`).
- **Clean A4 Printing**: `@media print` stylesheets strip application headers, buttons, and margins for a pure print-ready invoice.

### 4. Reliable Database & Auto-Incrementing Sequence
- **Next Number Sequence**: Starts automatically at `42647` (following sample invoice `42646`) and increments sequentially on the server.
- **Duplicate Prevention**: Atomic database sequence checks reject duplicate invoice numbers with a 409 Conflict alert.
- **Saved Invoices Hub**: Search by customer or invoice number, date filtering, load & edit, duplicate as new, or delete with confirmation.
- **Dual SQLite / Turso Driver**: Powered by `@libsql/client`. Runs on zero-config local SQLite for development, and connects seamlessly to remote Turso for serverless Vercel deployments.

### 5. Secure Direct Authentication
- **No Public Sign-Up**: Public registration is completely disabled; only authorized users with credentials can access the portal.
- **Server-Side Session Verification**: Signed HTTP-only session cookies using JWT (`jose`).
- **Sliding-Window Rate Limiting**: Protects against brute-force attacks (5 failed attempts locks the IP for 15 minutes).
- **Configurable Credentials**: Change credentials via environment variables without touching application code.

---

## 🔐 Default Access Credentials

| Field | Value |
| :--- | :--- |
| **Username** | `royalinvoice` |
| **Password** | `Royal#Orbit@42647!` |

> **Note on Shared Access Model**: These credentials provide access to a shared business workspace. All authorized staff who know these credentials will manage the same invoice database. Keep the password secure and update it via environment variables when needed.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with TypeScript)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Engine**: jsPDF + html2canvas
- **Database**: `@libsql/client` (SQLite locally / Turso in cloud)
- **Auth**: JOSE (JWT signed HTTP-only cookies)
- **Deployment**: Vercel & GitHub

---

## 📁 Project Structure

```
royal-hair-wigs-invoice/
├── public/
│   ├── logo.png               # Official Royal Hair Wigs logo
│   └── watermark.png          # Faint crest watermark (8% alpha)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Login, logout, session verification
│   │   │   ├── invoices/      # CRUD, sequence, duplicate check
│   │   │   └── settings/      # Default company settings
│   │   ├── globals.css        # Tailwind & A4 print media queries
│   │   ├── layout.tsx         # Root layout with Inter font
│   │   └── page.tsx           # Main workspace coordinating editor & preview
│   ├── components/
│   │   ├── AppHeader.tsx      # Top bar with logo, actions, modals
│   │   ├── InvoiceEditor.tsx  # 3-tab editor (Details, Items, Extra Costs)
│   │   ├── InvoicePreview.tsx # Authentic A4 recreated invoice view
│   │   ├── LoginPage.tsx      # Navy blue luxury login interface
│   │   ├── SavedInvoicesModal.tsx  # Manage, search, duplicate invoices
│   │   └── CompanySettingsModal.tsx# Configure company defaults
│   ├── lib/
│   │   ├── auth.ts            # JWT authentication & rate limiter
│   │   ├── db.ts              # SQLite / Turso database repository
│   │   └── pdfGenerator.ts    # High-resolution PDF downloader & print trigger
│   └── types/
│       └── invoice.ts         # TypeScript interfaces & default constants
├── .env.example               # Environment variables template
├── .gitignore                 # Standard git exclusions
├── package.json
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm or pnpm

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mominofficial1/royal-hair-wigs-invoice.git
   cd royal-hair-wigs-invoice
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to customize username, password, or session secret if desired.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) and log in with:
   - Username: `royalinvoice`
   - Password: `Royal#Orbit@42647!`

---

## 🌐 Production Deployment on Vercel

### Step 1: Connect GitHub Repository
1. Push this repository to your GitHub account (`mominofficial1`).
2. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `royal-hair-wigs-invoice` repository.

### Step 2: Configure Environment Variables in Vercel
In the Vercel project configuration screen, add the following variables:

| Variable Name | Recommended Value / Description |
| :--- | :--- |
| `AUTH_USERNAME` | `astroinvoice` (or your chosen business username) |
| `AUTH_PASSWORD` | `Orbit#42646` (or your chosen business password) |
| `SESSION_SECRET` | 32+ character random secret (e.g. generate via `openssl rand -hex 32`) |
| `TURSO_DATABASE_URL` | *(Optional but recommended for multi-region serverless)*: `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | *(Optional)*: Your Turso database authorization token |

> **Database Storage on Vercel**: If `TURSO_DATABASE_URL` is omitted, the application uses local SQLite stored in `/tmp/invoices.db`. For persistent multi-user production data across Vercel serverless cold starts, sign up for a free database at [turso.tech](https://turso.tech) and set the two Turso environment variables.

### Step 3: Deploy
Click **Deploy**. Vercel will automatically run `npm run build` and provision your live HTTPS URL.

---

## 📄 License & Confidentiality

© 2026 **Royal Hair Wigs — Processed Hair & Wig Manufacturer**. All rights reserved.
Developed for official company invoice generation and accounting operations.
