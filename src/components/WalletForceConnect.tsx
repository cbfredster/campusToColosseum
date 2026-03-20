"use client";

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function WalletForceConnect() {
  const { connected, connect, disconnect, publicKey, connecting } = useWallet();

  async function handleConnect() {
    try {
      if (!connected) await connect();
    } catch (e: any) {
      // Only log unexpected errors, suppress 'User rejected the request.'
      if (e?.message !== 'User rejected the request.') {
        console.error('wallet connect failed', e);
      }
      // Optionally, show a toast or UI message here if needed
    }
  }

  return (
    <div>
      {!connected ? (
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="text-sm px-4 py-2 rounded-full border border-white/10 hover:bg-white/5"
        >
          {connecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
      ) : (
        <button
          onClick={() => disconnect()}
          className="text-sm px-3 py-2 rounded-full border border-white/10 hover:bg-white/5"
        >
          {publicKey ? `${publicKey.toString().slice(0,6)}...` : 'Connected'}
        </button>
      )}
    </div>
  );
}
