import { LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
export const generateSolTransferInst = (from, to, amount) => {
    return SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: Math.floor(amount * LAMPORTS_PER_SOL)
    });
};
