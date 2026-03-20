"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Connection, PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi';
import WalletMultiButtonClient from '@/components/WalletMultiButtonClient';
import WalletForceConnect from '@/components/WalletForceConnect';
import { useWallet } from '@solana/wallet-adapter-react';
// Define Rsvp type if not imported
type Rsvp = TicketRow;
import QRCode from 'react-qr-code';

// Type definitions
type TicketRow = {
	id: string;
	event_id: string;
	user_wallet: string;
	nft_mint?: string | null;
	created_at?: string | null;
};

type EventRow = {
		id: string;
		name: string;
		date: string;
		venue?: string | null;
		image_url?: string | null;
};

// ...existing code...
									// const asset = await fetchAsset(umi, mint); // Unsupported, comment out

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const solanaRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export default function MyTickets() {
	const { connected, publicKey } = useWallet();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [rsvps, setRsvps] = useState<Rsvp[]>([]);
	const [events, setEvents] = useState<Record<string, EventRow>>({});
		const [walletNfts, setWalletNfts] = useState<{ mint: string; name?: string; uri?: string }[]>([]); // NFT mint addresses and metadata

	const supabase = useMemo(() => {
		if (!supabaseUrl || !supabaseAnonKey) return null;
		return createClient(supabaseUrl, supabaseAnonKey);
	}, []);

		useEffect(() => {
			async function load() {
				setError(null);
				setRsvps([]);
				setEvents({});
				setWalletNfts([]);

				if (!connected || !publicKey) return;
				if (!supabase) {
					setError('Missing Supabase configuration (NEXT_PUBLIC_SUPABASE_URL / ANON KEY)');
					return;
				}

				setLoading(true);
				try {
					const walletAddr = publicKey.toString();

					// 1. Fetch RSVPs from Supabase
					const { data: rData, error: rError } = await supabase
						.from('rsvps')
						.select('id,event_id,nft_mint,created_at')
						.eq('wallet_address', walletAddr)
						.order('created_at', { ascending: false });

					if (rError) throw rError;

					const rList = (rData as Rsvp[]) ?? [];
					setRsvps(rList);

					// 2. Fetch related events
					const eventIds = Array.from(new Set(rList.map((r) => r.event_id))).filter(Boolean);
					if (eventIds.length > 0) {
						const { data: eData, error: eError } = await supabase
							.from('events')
							.select('id,name,date,venue,image_url')
							.in('id', eventIds as string[]);

						if (eError) throw eError;

						const map: Record<string, EventRow> = {};
						(eData as EventRow[] ?? []).forEach((ev) => {
							map[ev.id] = ev;
						});
						setEvents(map);
					}

					// 3. Scan wallet for NFTs (SPL tokens with supply 1, decimals 0)
					const connection = new Connection(solanaRpcUrl, 'confirmed');
					const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
						new PublicKey(walletAddr),
						{ programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
					);

									const nfts: { mint: string; name?: string; uri?: string }[] = [];
									// Create UMI instance for asset metadata fetch
									// const umi = createUmi(solanaRpcUrl); // Commented out, unsupported
									for (const { account } of tokenAccounts.value) {
										const parsed = account.data.parsed;
										const info = parsed.info;
										// Only show tokens with 0 decimals and amount 1
										if (info.tokenAmount.decimals === 0 && info.tokenAmount.uiAmount === 1) {
											const mint = info.mint;
											let name = undefined;
											let uri = undefined;
														try {
															// Removed unsupported fetchAsset and umi usage
															// Removed asset?.name and asset?.uri (asset is undefined)
														} catch (e) {
															console.warn('Failed to fetch NFT metadata for mint', mint, e);
														}
														// Show all NFTs with supply 1/decimals 0, regardless of metadata
														nfts.push({ mint, name, uri });
										}
									}
									setWalletNfts(nfts);
				} catch (e: any) {
					console.error('Failed to load my tickets', e);
					setError(e?.message || 'Failed to load tickets');
				} finally {
					setLoading(false);
				}
			}

			load();
		}, [connected, publicKey, supabase]);

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-4xl mx-auto px-4 py-12">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">My Tickets</h1>
					<div className="flex items-center gap-3">
						<WalletMultiButtonClient />
						<WalletForceConnect />
					</div>
				</div>

				{!connected && (
					<div className="text-center text-white/70 py-12">
						Connect your wallet to view your tickets.
					</div>
				)}

				{connected && (
					<div>
						{loading && <div className="text-center text-white/70">Loading tickets…</div>}
						{error && <div className="text-red-400 text-center mb-4">{error}</div>}

									{!loading && rsvps.length === 0 && walletNfts.length === 0 && (
										<div className="text-center text-white/60 py-10">You don't have any tickets yet.</div>
									)}

												{/* RSVP-based tickets from Supabase */}
												<div className="grid grid-cols-1 gap-4">
													{rsvps.map((r) => {
														const ev = events[r.event_id];
														return (
															<div key={r.id} className="bg-zinc-900 p-4 rounded-lg border border-white/10 flex items-center justify-between">
																<div>
																	<div className="text-lg font-semibold">{ev?.name ?? `Event ${r.event_id}`}</div>
																	<div className="text-sm text-white/60">{ev?.date ? new Date(ev.date).toLocaleString() : 'Unknown date'}</div>
																	<div className="text-sm text-white/60 mt-1">RSVP ID: {r.id}</div>
																	<div className="text-sm text-white/60 mt-1">
																		Mint: {r.nft_mint ? r.nft_mint : 'pending'}
																		<span className={r.nft_mint ? 'ml-2 text-green-400' : 'ml-2 text-yellow-400'}>
																			{r.nft_mint ? 'Minted' : 'Mint pending'}
																		</span>
																	</div>
																</div>
																<div className="flex flex-col items-end gap-2">
																	{r.nft_mint ? (
																		<>
																			<a
																				className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded mb-2"
																				href={`https://explorer.solana.com/address/${r.nft_mint}?cluster=devnet`}
																				target="_blank"
																				rel="noreferrer"
																			>
																				View on Explorer
																			</a>
																			<div className="mt-2">
																				<QRCode value={`https://explorer.solana.com/address/${r.nft_mint}?cluster=devnet`} size={64} bgColor="#000" fgColor="#fff" />
																			</div>
																		</>
																	) : (
																		<div className="text-sm text-white/60">Mint pending</div>
																	)}
																	<div className="text-xs text-white/50">{ev?.venue ?? ''}</div>
																</div>
															</div>
														);
													})}
												</div>

												{/* Wallet NFT tickets (not in RSVPs) */}
												{walletNfts.length > 0 && (
													<div className="mt-8">
														<h2 className="text-xl font-bold mb-4">NFT Tickets in Wallet</h2>
														<div className="grid grid-cols-1 gap-4">
															{walletNfts.map((nft) => (
																<div key={nft.mint} className="bg-zinc-900 p-4 rounded-lg border border-purple-600 flex items-center justify-between">
																	<div>
																		<div className="text-lg font-semibold">{nft.name ?? 'NFT Ticket'}</div>
																		<div className="text-sm text-white/60 mt-1">Mint: {nft.mint}</div>
																		{nft.uri && (
																			<div className="text-xs text-white/50 mt-1">URI: {nft.uri}</div>
																		)}
																	</div>
																	<div className="flex flex-col items-end gap-2">
																		<a
																			className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded"
																			href={`https://explorer.solana.com/address/${nft.mint}?cluster=devnet`}
																			target="_blank"
																			rel="noreferrer"
																		>
																			View on Explorer
																		</a>
																	</div>
																</div>
															))}
														</div>
													</div>
												)}
					</div>
				)}
			</div>
		</div>
	);
}
