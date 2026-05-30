# 🪪 MemberFlow: Membership Management System

A clean, premium SaaS-style dashboard built with **Next.js (App Router)**, **Tailwind CSS**, **Axios**, and **Supabase**. Admins can register/login, manage organizations, register members, generate high-fidelity digital ID badges with scan-to-verify QR codes, and export badges as PDFs.

---

## 🎯 Features

* **Secure Authentication**: Built-in authorization handling utilizing Supabase Auth.
* **Overview Analytics**: Dynamic SaaS dashboard monitoring organization distributions and account status statistics.
* **Organization Management (CRUD)**: Create and search organizations with automated member count updates.
* **Member Management (CRUD)**: Add, edit, search, filter, and delete member profiles.
* **Digital ID Badges**: Double-sided high-fidelity badge layout containing avatars, unique codes, role metadata, and offline verification QR codes.
* **PDF Export**: High-resolution client-side canvas rendering and PDF downloads.
* **QR Verification Page**: Public verification page (`/verify/[id]`) that security checkpoints can scan to instantly verify credentials without authentication checks.

---

## 🧱 Tech Stack

* **Frontend**: Next.js 16 (React 19, App Router)
* **Styling**: Tailwind CSS (v4)
* **API Handling**: Axios
* **Database & Auth**: Supabase (PostgreSQL with RLS and trigger automations)
* **Utility Libraries**: `lucide-react` (icons), `qrcode.react` (QR generation), `jspdf` & `html2canvas` (PDF rendering)

---

## 🛠️ Database Setup (Supabase)

To initialize your backend database:
1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** in the left sidebar menu.
3. Click **New Query**, paste the contents of [**`schema.sql`**](./schema.sql), and click **Run**.
4. This script sets up all tables, foreign keys, Row Level Security (RLS) policies for secure access, and automated trigger functions.

---

## ⚙️ Environment Configuration

Create a `.env.local` file in your root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ioqycactywsevmoqqegk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 🚀 Local Development Setup

To run this application locally:

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment (Vercel)

When deploying this project to **Vercel**:
1. Connect your GitHub repository to Vercel.
2. Under **Project Settings > Environment Variables**, add the three environment variables defined in your `.env.local`:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
3. Trigger a redeploy.
