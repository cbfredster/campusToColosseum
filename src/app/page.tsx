'use client';
 
import Link from 'next/link';
import { useEffect, useState } from 'react';
import WalletMultiButtonClient from '@/components/WalletMultiButtonClient';
import WalletForceConnect from '@/components/WalletForceConnect';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const { connected, publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight">DurhamEvents</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/events/my-tickets"
              className="text-sm px-4 py-2 rounded-full border border-white/10 hover:bg-white/5"
            >
              My Tickets
            </Link>
            <WalletMultiButtonClient />
            <WalletForceConnect />
            <div className="text-sm text-white/60">
              {connected ? `Connected: ${publicKey?.toString().slice(0,6)}...` : 'Not connected'}
            </div>
          </div>
        </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32 gap-6">
        <span className="text-sm uppercase tracking-widest text-purple-400 font-medium">
          Powered by Solana
        </span>
        <h1 className="text-5xl font-extrabold leading-tight max-w-2xl">
          Durham Society Events,{' '}
          <span className="text-purple-400">On-Chain</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl">
          RSVP to Durham University society events and collect your NFT ticket
          instantly on Solana. No middlemen, no lost tickets.
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/events"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Browse Events
          </Link>
          <Link
            href="/events/create"
            className="border border-white/20 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Create Event
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-8 pb-24 max-w-5xl mx-auto">
        <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
          <div className="text-3xl mb-3">🎟️</div>
          <h3 className="text-lg font-semibold mb-2">NFT Tickets</h3>
          <p className="text-zinc-400 text-sm">
            Every ticket is a unique NFT on Solana. Prove attendance, trade, or
            keep it as a memory.
          </p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="text-lg font-semibold mb-2">Instant RSVP</h3>
          <p className="text-zinc-400 text-sm">
            Connect your wallet and RSVP in seconds. Your ticket is minted
            straight to your wallet.
          </p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
          <div className="text-3xl mb-3">🎓</div>
          <h3 className="text-lg font-semibold mb-2">Society Events</h3>
          <p className="text-zinc-400 text-sm">
            Built for Durham University societies. Film nights, formals,
            socials — all in one place.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-zinc-600 text-sm py-6 border-t border-white/10">
        Built for Durham 🏰
      </footer>

    </div>
  );
}