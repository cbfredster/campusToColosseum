'use client';

import { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [recipientWallet, setRecipientWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError('Missing Supabase configuration');
      return;
    }

    if (!name || !date || !venue) {
      setError('Please fill in name, date and venue');
      return;
    }

    // If a price is set and > 0, recipient wallet must be provided unless a
    // default payout is configured via NEXT_PUBLIC_DEFAULT_PAYOUT (useful for testing).
    const priceNum = price === '' ? null : Number(price);
    const defaultPayout = process.env.NEXT_PUBLIC_DEFAULT_PAYOUT || null;
    if (
      priceNum &&
      Number.isFinite(priceNum) &&
      priceNum > 0 &&
      (!recipientWallet || recipientWallet.trim() === '') &&
      !(defaultPayout && defaultPayout.trim() !== '')
    ) {
      setError('Price is set — please provide a recipient wallet to receive payouts');
      return;
    }

    setLoading(true);

    try {
      // If provided, validate recipient wallet is a valid Solana public key
      if (recipientWallet && recipientWallet.trim() !== '') {
        try {
          // Will throw if invalid
          // eslint-disable-next-line no-new
          new PublicKey(recipientWallet.trim());
        } catch (err) {
          setError('Recipient wallet is not a valid Solana public key');
          setLoading(false);
          return;
        }
      }
      const { error: insertError } = await supabase.from('events').insert({
        name,
        description: description || null,
        date,
        venue,
        capacity: capacity === '' ? null : Number(capacity),
        price_sol: price === '' ? null : Number(price),
        recipient_wallet: recipientWallet || null,
        image_url: imageUrl || null,
      });

      if (insertError) throw insertError;

      // Redirect back to events list
      router.push('/events');
    } catch (e: any) {
      setError(e?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Create Event</h1>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input
            placeholder="Event name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 h-28"
          />

          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3"
          />

          <input
            placeholder="Venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3"
          />

          <input
            type="number"
            placeholder="Capacity"
            value={capacity === '' ? '' : String(capacity)}
            onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3"
          />

          <input
            type="number"
            step="0.0000001"
            placeholder="Price (SOL)"
            value={price === '' ? '' : String(price)}
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3"
          />

          <input
            placeholder="Recipient wallet (optional)"
            value={recipientWallet}
            onChange={(e) => setRecipientWallet(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3"
          />
          {price !== '' && Number(price) > 0 ? (
            <div className="text-xs text-white/60">Recipient wallet is required when a price is set.</div>
          ) : (
            <div className="text-xs text-white/40">Recipient wallet (optional)</div>
          )}

          <input
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-full font-semibold ${loading ? 'bg-white/10 text-white/60' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? 'Creating…' : 'Create Event'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/events')}
              className="px-6 py-3 rounded-full border border-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
