"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { mintEventTicket } from "@/lib/mintTicket";
import {
  Connection,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

type Event = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  venue: string;
  capacity: number;
  price_sol: number | string | null;
  image_url: string | null;
  // possible payout/recipient columns in Supabase (optional)
  recipient_wallet?: string | null;
  wallet_address?: string | null;
  owner_wallet?: string | null;
  host_wallet?: string | null;
  payout_address?: string | null;
  [key: string]: any;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function EventsPage() {
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  const wallet = useWallet();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketStatus, setTicketStatus] = useState<Record<string, boolean>>({});
  const [rsvpLoading, setRsvpLoading] = useState<Record<string, boolean>>({});
  const [rsvpProgress, setRsvpProgress] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [rsvpSuccess, setRsvpSuccess] = useState<string | null>(null);

  function formatDate(dateValue: string) {
    try {
      return new Date(dateValue).toLocaleString();
    } catch {
      return dateValue;
    }
  }

  function formatSol(price: Event["price_sol"]) {
    if (price === null || price === undefined || price === "") return "—";
    const num = typeof price === "number" ? price : Number(price);
    if (!Number.isFinite(num)) return "—";
    return num.toString();
  }

  function eventHasPayout(event: Event) {
    const price = event.price_sol;
    const num = price === null || price === undefined || price === '' ? null : typeof price === 'number' ? price : Number(price);
    const priced = num !== null && Number.isFinite(num) && num > 0;

    const recipient =
      event.recipient_wallet ||
      event.wallet_address ||
      event.owner_wallet ||
      event.host_wallet ||
      event.payout_address ||
      null;

    // Allow fallback payout address from env for testing/dev when set
    const defaultPayout = process.env.NEXT_PUBLIC_DEFAULT_PAYOUT || null;

    return (
      !priced ||
      (recipient && typeof recipient === 'string' && recipient.trim() !== '') ||
      (defaultPayout && typeof defaultPayout === 'string' && defaultPayout.trim() !== '')
    );
  }

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      setRsvpSuccess(null);
      try {
        if (!supabase) {
          throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
          );
        }

        // Select all columns so any owner/payout wallet saved on the row is available.
        const { data, error: supabaseError } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (supabaseError) throw supabaseError;
        setEvents((data as Event[]) ?? []);
      } catch (e: any) {
        setError(e?.message || "Failed to fetch events");
      }
      setLoading(false);
    }

    fetchEvents();
  }, [supabase]);

  async function handleGetTicket(event: Event) {
    setError(null);
    setRsvpSuccess(null);

    if (!wallet?.connected || !wallet.publicKey) {
      window.alert("Please connect your wallet first.");
      return;
    }

    if (!supabase) {
      setError(
        "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
      return;
    }

    try {
      setRsvpLoading((prev) => ({ ...prev, [event.id]: true }));
      setRsvpProgress((prev) => ({ ...prev, [event.id]: 'Starting...' }));

      // Check if this wallet already has an RSVP for this event to avoid
      // duplicate payments/mints. If found, treat as success and skip flow.
      try {
        const { data: existing, error: existingErr } = await supabase
          .from('rsvps')
          .select('id,nft_mint')
          .eq('event_id', event.id)
          .eq('wallet_address', wallet.publicKey.toString())
          .limit(1)
          .maybeSingle();

        if (existingErr) {
          // Non-fatal; we'll continue and let insert handle duplicates
          console.warn('Failed to check existing RSVP', existingErr);
        }

        if (existing) {
          setTicketStatus((prev) => ({ ...prev, [event.id]: true }));
          setRsvpSuccess(`You already have an RSVP. NFT mint: ${existing.nft_mint ?? 'unknown'}`);
          setRsvpProgress((prev) => ({ ...prev, [event.id]: 'Already registered' }));
          return;
        }
      } catch (err) {
        console.warn('Error while checking existing rsvp', err);
      }

      // If the event has a numeric price (seller should have supplied a payout address
      // in the row) attempt to send SOL to that address first.
      const priceNum =
        event.price_sol === null || event.price_sol === ""
          ? null
          : typeof event.price_sol === "number"
          ? event.price_sol
          : Number(event.price_sol);

  if (priceNum && Number.isFinite(priceNum) && priceNum > 0) {
        // Determine recipient from common column names (fallbacks).
        const recipient =
          event.recipient_wallet ||
          event.wallet_address ||
          event.owner_wallet ||
          event.host_wallet ||
          event.payout_address ||
          (process.env.NEXT_PUBLIC_DEFAULT_PAYOUT || null);

        if (!recipient || typeof recipient !== "string") {
          throw new Error(
            "Event has a price but no recipient/payout address found in the event row"
          );
        }

        // Build connection and transfer transaction.
        const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
          "https://api.devnet.solana.com";
        const connection = new Connection(rpcUrl, "confirmed");

        let toPubkey: PublicKey;
        try {
          toPubkey = new PublicKey(recipient);
        } catch (err) {
          throw new Error("Invalid recipient public key for event payout");
        }

        const lamports = Math.round(Number(priceNum) * LAMPORTS_PER_SOL);

        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey!,
            toPubkey,
            lamports,
          })
        );

        // Ensure the wallet adapter supports sendTransaction
        if (typeof wallet.sendTransaction !== 'function') {
          throw new Error(
            'Connected wallet does not support sendTransaction. Please use a wallet that supports sending SOL (e.g. Phantom).' 
          );
        }

        setRsvpProgress((prev) => ({ ...prev, [event.id]: `Requesting signature to pay ${priceNum} SOL...`}));

        // sendTransaction is provided by the wallet adapter
        const signature = await wallet.sendTransaction(tx, connection);

        if (!signature) {
          throw new Error('Payment transaction failed to return a signature');
        }

        setRsvpProgress((prev) => ({ ...prev, [event.id]: `Waiting for payment confirmation (${signature})...`}));

        // Confirm the transaction before continuing
        await connection.confirmTransaction(signature, "confirmed");

        setRsvpProgress((prev) => ({ ...prev, [event.id]: 'Payment confirmed — minting ticket...'}));
      }

      // Force an explicit wallet signature popup before minting so the user
      // authorises the mint via Phantom (or another adapter). We use the
      // Memo program to create a small signable instruction that doesn't move
      // tokens — it's only to request the user's signature.
      try {
        setRsvpProgress((prev) => ({ ...prev, [event.id]: 'Requesting signature to authorize mint...' }));

        const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
          "https://api.devnet.solana.com";
        const connection = new Connection(rpcUrl, 'confirmed');

        const memoProgramId = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
        const tx = new Transaction({ feePayer: wallet.publicKey! });

        // Attach a small memo identifying the mint action — this creates a
        // normal transaction that the wallet will ask the user to sign.
        const memoIx = new TransactionInstruction({
          keys: [],
          programId: memoProgramId,
          data: Buffer.from(`Authorize mint for event ${event.id}`),
        });

        tx.add(memoIx);

        // Add recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;

        if (typeof wallet.signTransaction === 'function') {
          // This will prompt the wallet to request a signature but won't send the tx
          await wallet.signTransaction(tx);
        } else if (typeof wallet.sendTransaction === 'function') {
          // Fallback: send the small memo transaction — this will also prompt the user
          const sig = await wallet.sendTransaction(tx, connection);
          await connection.confirmTransaction(sig, 'confirmed');
        } else {
          throw new Error('Connected wallet does not support signing transactions');
        }

        setRsvpProgress((prev) => ({ ...prev, [event.id]: 'Signature received — proceeding to mint...' }));
      } catch (e: any) {
        // If the user rejects the signature or an error occurs, stop.
        const msg = e?.message || 'Signature required to proceed with mint';
        console.error('Signature step failed', e);
        throw new Error(msg);
      }

      const nftMint = await mintEventTicket({
        wallet,
        eventId: event.id,
        eventName: event.name,
      });

      const { error: upsertError } = await supabase
        .from("rsvps")
        .upsert([
          {
            event_id: event.id,
            wallet_address: wallet.publicKey.toString(),
            nft_mint: nftMint,
          }
        ], { onConflict: 'event_id,wallet_address' });

      if (upsertError) {
        throw upsertError;
      }

      setTicketStatus((prev) => ({ ...prev, [event.id]: true }));
      setRsvpProgress((prev) => ({ ...prev, [event.id]: 'Done' }));
      setRsvpSuccess(`RSVP successful! NFT mint: ${nftMint}`);
    } catch (e: any) {
      const message = e?.message || "Failed to request ticket";
      console.error('handleGetTicket error for', event.id, message, e);
      setError(message);
    } finally {
      setRsvpLoading((prev) => ({ ...prev, [event.id]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Upcoming Events
        </h1>

        {loading && (
          <div className="flex justify-center text-white/70">
            Loading events...
          </div>
        )}

        {error && (
          <div className="text-red-400 text-center mb-4">{error}</div>
        )}

        {rsvpSuccess && (
          <div className="text-green-400 text-center mb-4">{rsvpSuccess}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              {event.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.image_url}
                  alt={event.name}
                  className="w-full h-48 object-cover bg-zinc-800"
                />
              ) : (
                <div className="w-full h-48 bg-zinc-800" />
              )}

              <div className="p-6 flex flex-col flex-1 gap-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold leading-tight">
                    {event.name}
                  </h2>
                  <span className="text-xs text-white/50">
                    ID: {event.id}
                  </span>
                </div>

                {event.description ? (
                  <p className="text-sm text-white/70 leading-relaxed">
                    {event.description}
                  </p>
                ) : (
                  <p className="text-sm text-white/50 leading-relaxed">
                    No description provided.
                  </p>
                )}

                <div className="text-sm space-y-1 text-white/80">
                  <div>
                    <span className="text-white/55">Date:</span>{" "}
                    {formatDate(event.date)}
                  </div>
                  <div>
                    <span className="text-white/55">Venue:</span>{" "}
                    {event.venue}
                  </div>
                  <div>
                    <span className="text-white/55">Capacity:</span>{" "}
                    {event.capacity}
                  </div>
                  <div>
                    <span className="text-white/55">Price:</span>{" "}
                    {formatSol(event.price_sol)} SOL
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  className={`w-full px-4 py-2 rounded-xl font-semibold transition ${
                    ticketStatus[event.id] || rsvpLoading[event.id] || !eventHasPayout(event)
                      ? "bg-white/10 text-white/60 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                  onClick={() => handleGetTicket(event)}
                  disabled={
                    ticketStatus[event.id] || rsvpLoading[event.id] || !eventHasPayout(event)
                  }
                >
                  {rsvpLoading[event.id]
                    ? "Minting Ticket..."
                    : ticketStatus[event.id]
                      ? "Ticket Requested"
                      : "Get Ticket"}
                </button>

                {/* If the event is priced but has no recipient/payout address, show a hint */}
                {!eventHasPayout(event) && (
                  <div className="text-xs text-yellow-300 mt-2">
                    This event requires a payout address. Organizer must add a recipient wallet to the event (recipient_wallet) before purchases are allowed.
                  </div>
                )}
                {rsvpProgress[event.id] && (
                  <div className="text-xs text-white/60 mt-2">
                    {rsvpProgress[event.id]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && events.length === 0 && (
          <div className="text-center text-white/50 mt-10">
            No events available.
          </div>
        )}
      </div>
    </div>
  );
}