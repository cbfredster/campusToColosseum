'use client';

import { useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function WalletMultiButtonClient() {
  // Render a stable placeholder that matches what the server initially
  // produced. After hydration/mount we replace it with the interactive
  // WalletMultiButton to avoid React hydration mismatch errors.
  const [mounted, setMounted] = useState(false);
  const { wallets } = useWallet();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Server-rendered placeholder (non-interactive) to ensure markup
    // matches between server and client during hydration.
    return (
      <button className="wallet-adapter-button bg-purple-600 text-white font-semibold px-4 py-2 rounded-full">
        Select Wallet
      </button>
    );
  }

  // Client: if adapters haven't registered yet, show a disabled loading
  // button so users can't click and cause WalletNotReadyError.
  if (!wallets || wallets.length === 0) {
    return (
      <button disabled className="wallet-adapter-button opacity-60 cursor-not-allowed bg-purple-600 text-white font-semibold px-4 py-2 rounded-full">
        Loading wallets...
      </button>
    );
  }

  // Adapters available: render the real button.
  return <WalletMultiButton />;
}

// Minimal stub for SwitchAccountOverlay in case other files (or stale builds)
// attempt to import it. Keeps behavior simple: renders a basic modal when
// `visible` is true, otherwise renders null.
export function SwitchAccountOverlay({
  visible = false,
  onReconnect,
  onCancel,
}: any) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg p-6 max-w-sm w-full">
        <h3 className="font-semibold mb-2">Switch Account</h3>
        <p className="text-sm text-zinc-600 mb-4">If you need to switch accounts, use your wallet UI to change accounts, then click Reconnect.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={onReconnect} className="px-3 py-1 bg-purple-600 text-white rounded">Reconnect</button>
        </div>
      </div>
    </div>
  );
}

