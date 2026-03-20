"use client";

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, publicKey as umiPublicKey } from '@metaplex-foundation/umi';
import { create, mplCore } from '@metaplex-foundation/mpl-core';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import type { WalletContextState } from '@solana/wallet-adapter-react';

type MintTicketArgs = {
  wallet: WalletContextState;
  eventId: string;
  eventName: string;
};

export async function mintEventTicket({
  wallet,
  eventId,
  eventName,
}: MintTicketArgs): Promise<string> {
  if (!wallet?.publicKey) {
    throw new Error('Wallet not connected');
  }

  // Create UMI for devnet and authenticate with the connected wallet.
  const umi = createUmi('https://api.devnet.solana.com')
    .use(walletAdapterIdentity(wallet))
    .use(mplCore());

  // Generate an asset signer and mint via mpl-core `create()`.
  const asset = generateSigner(umi);

  // mpl-core requires a URI string; we use a small data URI for now.
  const uri = `data:application/json,${encodeURIComponent(
    JSON.stringify({ name: `${eventName} Ticket #${eventId}` })
  )}`;

  await create(umi, {
    name: eventName, // Asset name as requested.
    uri,
    asset,
    authority: umi.identity,
  owner: umiPublicKey(wallet.publicKey.toString()),
  }).sendAndConfirm(umi);

  return asset.publicKey.toString();
}