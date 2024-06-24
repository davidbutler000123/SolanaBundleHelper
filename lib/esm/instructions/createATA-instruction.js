import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
export const getCreateAccountTransactionInst = (payer, wallet, addr) => {
    const associatedToken = getAssociatedTokenAddressSync(new PublicKey(addr), wallet.publicKey, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    return createAssociatedTokenAccountInstruction(payer.publicKey, associatedToken, wallet.publicKey, new PublicKey(addr), TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
};
