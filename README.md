<div align="center">

<img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" width="64" height="64" alt="Solana" />

# Durham Events

### On-chain event ticketing for the North East, built on Solana.

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat-square&logo=solana&logoColor=white)](https://solana.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Metaplex](https://img.shields.io/badge/Metaplex-FF6B35?style=flat-square)](https://www.metaplex.com/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**[Live Demo](https://youtu.be/70YCRg4Fx9g)

---

</div>

## What is Durham Events?

Durham Events is a modern, decentralised event ticketing platform built for the North East UK university scene and beyond. Rather than relying on centralised ticket databases that can be faked, lost, or counterfeited, Durham Events issues every RSVP as a **real NFT** minted directly to your Solana wallet. Your ticket lives on-chain — verifiable, tamper-proof, and uniquely yours.

Connect your wallet, browse local events, RSVP in seconds, and receive a cryptographically unique NFT ticket. Event organisers can verify attendance with a QR code scanner, and attendees carry a digital collectible that proves they were there.

> Built for the **Campus to Colosseum Hackathon** — a two-week Solana hackathon for North East UK university students.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [NFT Ticketing Deep Dive](#nft-ticketing-deep-dive)
- [Event Organiser Tools](#event-organiser-tools)
- [My Tickets & QR Verification](#my-tickets--qr-verification)
- [Developer Notes](#developer-notes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### 🔐 Solana Wallet Integration
Connect any Solana-compatible wallet (Phantom, Backpack, Solflare, and more) in a single click. Wallet addresses serve as your identity — no sign-up, no password, no centralised account. Authentication is handled entirely on-chain, meaning Durham Events never stores your private keys or credentials.

### 🎟️ NFT Ticketing via Metaplex
Every RSVP triggers a real NFT mint using **Metaplex UMI** and **mpl-core**. Each ticket is:
- **Unique** — minted with event-specific metadata (name, date, venue, seat/RSVP ID)
- **On-chain** — verifiable at any time on Solana Explorer
- **Owned by you** — transferred directly to your wallet at mint time
- **Non-duplicable** — one wallet, one ticket, per event (enforced on-chain and in Supabase)

### 🗄️ Supabase Backend
A Supabase Postgres database acts as the off-chain source of truth for event metadata, RSVP records, and NFT mint addresses. This hybrid approach gives you the verifiability of the blockchain with the query flexibility of a relational database — fast lookups, rich event data, and no RPC bottlenecks for UI rendering.

### 🪪 My Tickets Page
A personalised dashboard that scans your connected wallet for all Durham Events NFTs. For each ticket found, it displays:
- Event name, date, time, and venue
- Ticket mint address and on-chain status
- A generated QR code linking directly to the Solana Explorer page for that NFT

### 📲 QR Code Verification
Each ticket is paired with a QR code encoding its on-chain Explorer URL. Event organisers scan the QR code at the door — if the NFT exists in the wallet shown, the ticket is valid. No proprietary scanner hardware. No app required. Just a phone and Solana Explorer.

### 🛠️ Event Organiser Tools
A dedicated organiser interface for creating events, managing RSVPs, viewing attendee lists, and verifying ticket validity — all in one place.

### ⚡ Next.js 16 with Turbopack
Blazing-fast development builds and production SSR via Next.js 16's Turbopack integration. Pages that need SEO (event listings, landing pages) are server-rendered; wallet-dependent pages (RSVP, My Tickets) are client-hydrated cleanly using React 19's concurrent features.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Durham Events                            │
│                    Next.js 16 (Turbopack)                       │
├──────────────────────────┬──────────────────────────────────────┤
│       Frontend           │           Backend                    │
│  React 19 + Tailwind CSS │       Supabase (Postgres)            │
│  Solana Wallet Adapter   │   Events · RSVPs · Ticket Metadata   │
│  react-qr-code           │                                      │
├──────────────────────────┴──────────────────────────────────────┤
│                      Solana Blockchain                          │
│         Metaplex UMI · mpl-core NFT Standard                   │
│     NFT Minting · Wallet Auth · On-chain Ticket Ownership       │
└─────────────────────────────────────────────────────────────────┘
```

**Data flow for an RSVP:**

```
User clicks "RSVP"
      │
      ▼
Wallet signs transaction
      │
      ▼
Metaplex UMI mints NFT → NFT lands in user's wallet
      │
      ▼
Mint address + RSVP record saved to Supabase
      │
      ▼
My Tickets page fetches wallet NFTs + Supabase metadata
      │
      ▼
QR code generated from on-chain Explorer URL
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (Turbopack) | SSR, routing, fast builds |
| **UI** | React 19, Tailwind CSS | Component model, responsive design |
| **Blockchain** | Solana | Decentralised ticketing layer |
| **Wallet** | `@solana/wallet-adapter-react` | Wallet connection & signing |
| **NFT Minting** | Metaplex UMI, `mpl-core` | NFT creation & metadata standard |
| **Database** | Supabase (Postgres) | Off-chain event & RSVP data |
| **QR Codes** | `react-qr-code` | Ticket verification QR generation |
| **Language** | TypeScript | Full-stack type safety |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** (recommended) or npm/yarn
- A **Supabase** project ([create one free](https://supabase.com))
- A **Solana** wallet (e.g. [Phantom](https://phantom.app)) connected to Devnet for local development

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/durham-events.git
cd durham-events

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Metaplex (optional: custom RPC for minting reliability)
NEXT_PUBLIC_METAPLEX_RPC_URL=https://api.devnet.solana.com
```

### Database Setup

Run the following SQL in your Supabase SQL editor to initialise the schema:

```sql
-- Events table
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  organiser_wallet text not null,
  max_capacity int,
  created_at timestamptz default now()
);

-- RSVPs table
create table rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  wallet_address text not null,
  nft_mint_address text unique,
  rsvp_at timestamptz default now(),
  unique(event_id, wallet_address)
);
```

### Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs on Devnet by default — airdrop yourself some SOL at [faucet.solana.com](https://faucet.solana.com) to test minting.

---

## Project Structure

```
durham-events/
├── app/                      # Next.js 15+ App Router
│   ├── page.tsx              # Landing / event listings
│   ├── events/
│   │   └── [id]/
│   │       └── page.tsx      # Event detail + RSVP
│   ├── my-tickets/
│   │   └── page.tsx          # User ticket dashboard
│   └── organiser/
│       └── page.tsx          # Event creation & management
├── components/
│   ├── WalletButton.tsx      # Wallet connect / disconnect UI
│   ├── EventCard.tsx         # Event listing card
│   ├── RSVPButton.tsx        # RSVP + mint trigger
│   ├── TicketCard.tsx        # NFT ticket display + QR code
│   └── QRCode.tsx            # react-qr-code wrapper
├── lib/
│   ├── supabase.ts           # Supabase client initialisation
│   ├── metaplex.ts           # Metaplex UMI setup & mint logic
│   └── solana.ts             # RPC helpers & wallet utilities
├── hooks/
│   ├── useWalletNFTs.ts      # Fetch NFTs from connected wallet
│   └── useRSVP.ts            # RSVP state & mutation logic
└── types/
    └── index.ts              # Shared TypeScript interfaces
```

---

## How It Works

### 1. Connect Your Wallet
The app wraps your entire session in Solana's `WalletProvider` and `ConnectionProvider`. Clicking "Connect Wallet" opens the wallet adapter modal — select Phantom, Backpack, Solflare, or any injected wallet. Once connected, your public key is used as your identity across the app.

### 2. Browse & RSVP for Events
The homepage lists upcoming Durham events fetched server-side from Supabase. Each event page shows full details and an RSVP button. If you've already RSVPed (checked against Supabase + your wallet), the button shows your ticket status instead.

### 3. NFT Minting on RSVP
Clicking RSVP triggers the following sequence:
1. The app checks Supabase to confirm your wallet hasn't already RSVPed for this event.
2. Metaplex UMI constructs an `mpl-core` asset with event metadata (name, date, venue, RSVP ID) as on-chain attributes.
3. Your wallet signs the mint transaction.
4. Once confirmed, the NFT mint address is written to Supabase alongside your RSVP record.

### 4. View Your Tickets
The **My Tickets** page fetches all NFTs in your wallet using the Solana RPC, filters for Durham Events assets (by collection or creator address), then cross-references Supabase for rich event metadata. Each ticket renders as a card with event info and a QR code.

### 5. Verify at the Door
Organisers scan the attendee's QR code. This opens the NFT's Solana Explorer page, instantly confirming:
- The NFT exists on-chain
- It was minted by the Durham Events program
- It lives in the wallet the attendee is showing

---

## NFT Ticketing Deep Dive

Durham Events uses the **mpl-core** standard from Metaplex — the next-generation NFT standard on Solana that supersedes the older Token Metadata program. mpl-core assets are leaner, cheaper to mint, and support on-chain attributes natively without needing separate metadata accounts.

**Why mpl-core over SPL Token + Metadata?**

| Feature | SPL Token + Metadata | mpl-core |
|---|---|---|
| Accounts per NFT | 3–4 | 1 |
| Attribute storage | Off-chain JSON | On-chain, native |
| Mint cost | ~0.012 SOL | ~0.005 SOL |
| Composability | External plugins | Built-in plugin system |

**Ticket Metadata Structure:**

```json
{
  "name": "Durham Events – Hack Night #4",
  "uri": "https://your-metadata-uri.com/ticket/uuid",
  "attributes": [
    { "key": "event_id", "value": "uuid-here" },
    { "key": "event_date", "value": "2025-03-20T19:00:00Z" },
    { "key": "venue", "value": "The Collingwood College Bar" },
    { "key": "rsvp_id", "value": "rsvp-uuid-here" }
  ]
}
```

All attributes are written on-chain at mint time, making the ticket fully self-contained and verifiable without any off-chain dependency.

---

## Event Organiser Tools

The organiser dashboard (gated by wallet address) provides:

- **Create Event** — Set title, description, date, venue, and capacity. Saved to Supabase instantly.
- **RSVP List** — View all wallet addresses that have RSVPed, with their NFT mint addresses and timestamps.
- **Capacity Tracking** — Real-time RSVP count vs. max capacity. The RSVP button disables automatically when full.
- **Ticket Verification** — Paste or scan a wallet address to confirm a valid NFT ticket exists for your event.
- **Export** — Download the RSVP list as CSV for offline check-in or reporting.

> Organiser status is managed via a Supabase `organisers` table. In production, this can be extended to support multi-organiser roles and event co-hosting.

---

## My Tickets & QR Verification

The **My Tickets** page is where on-chain and off-chain data merge:

```tsx
// Simplified hook logic
const { nfts } = useWalletNFTs();                    // Fetches from Solana RPC
const { tickets } = useSupabaseTickets(nfts);         // Cross-references Supabase

// Each ticket renders with:
<TicketCard
  eventName={ticket.event.title}
  eventDate={ticket.event.event_date}
  venue={ticket.event.location}
  mintAddress={ticket.nft_mint_address}
/>
<QRCode value={`https://explorer.solana.com/address/${ticket.nft_mint_address}?cluster=devnet`} />
```

The QR code value is the full Solana Explorer URL for the NFT mint address. Anyone scanning it can instantly verify the ticket on the public blockchain — no account, no app, no trust in Durham Events required.

---

## Developer Notes

### Solana Network Config
The app defaults to **Devnet** for local development. Switch to Mainnet-Beta by updating `NEXT_PUBLIC_SOLANA_NETWORK` and `NEXT_PUBLIC_SOLANA_RPC_URL`. Note that Mainnet minting incurs real SOL costs — test thoroughly on Devnet first.

### RPC Rate Limits
Public Solana RPC endpoints are rate-limited. For production, use a dedicated RPC provider such as [Helius](https://helius.dev), [Alchemy](https://www.alchemy.com/solana), or [QuickNode](https://www.quicknode.com). Set your endpoint via `NEXT_PUBLIC_SOLANA_RPC_URL`.

### Metaplex UMI Setup

```ts
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";

export const createUmiInstance = (connection: Connection, wallet: WalletAdapter) =>
  createUmi(connection.rpcEndpoint)
    .use(mplCore())
    .use(walletAdapterIdentity(wallet));
```

### Supabase Row Level Security (RLS)
Enable RLS on both `events` and `rsvps` tables in production. The suggested policies:
- `events`: Public read; insert/update only for organiser wallets (check against `organisers` table)
- `rsvps`: Public read; insert only if `wallet_address = auth.jwt() ->> 'sub'` (when using wallet-based JWT auth)

### Server Components vs Client Components
- **Server components**: Event listings page, event detail page (fast SSR, SEO-friendly)
- **Client components**: WalletButton, RSVPButton, My Tickets page (require wallet context)

The app follows Next.js App Router best practices — `"use client"` is only added where wallet interaction is genuinely needed, keeping the SSR surface area large and time-to-first-byte low.

---

## Roadmap

- [ ] **Mainnet deployment** with production RPC
- [ ] **Collection NFTs** — group all Durham Events tickets under a single verified Metaplex collection
- [ ] **Secondary market** — list tickets for transfer via Tensor or Magic Eden
- [ ] **Push notifications** — Supabase Realtime alerts for event updates and capacity changes
- [ ] **Mobile app** — Expo Go / React Native port using the same Supabase + Solana stack
- [ ] **Token-gated events** — restrict RSVP to holders of specific NFTs or SPL tokens
- [ ] **Organiser analytics** — attendance graphs, demographic insights (wallet age, on-chain activity)
- [ ] **POAP-style retrospective mints** — post-event NFTs for confirmed attendees

---

## Contributing

Contributions are welcome and appreciated. To get started:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/token-gated-events`)
3. Commit your changes (`git commit -m 'feat: add token gating for RSVPs'`)
4. Push to the branch (`git push origin feature/token-gated-events`)
5. Open a Pull Request

Please ensure your PR includes:
- A clear description of what changed and why
- Tests for any new logic (especially minting and Supabase interactions)
- Updated documentation if you're adding a new feature

For major changes, open an issue first to discuss the approach.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built with ❤️ in Durham, UK · Powered by Solana · Campus to Colosseum Hackathon 2025

**[⬆ Back to top](#durham-events)**

</div>

-----------------------
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
