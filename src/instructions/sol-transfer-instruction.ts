import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";

export const generateSolTransferInst = (
  from: PublicKey,
  to: PublicKey,
  amount: number
) => {
  return SystemProgram.transfer({
    fromPubkey: from,
    toPubkey: to,
    lamports: Math.floor(amount * LAMPORTS_PER_SOL)
  });
};
