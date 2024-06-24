import { Connection, PublicKey } from "@solana/web3.js";
import {
  TokenAccount,
  TOKEN_PROGRAM_ID,
  SPL_ACCOUNT_LAYOUT,
  findProgramAddress
} from "@raydium-io/raydium-sdk";
import BN from "bn.js";
import BigNumber from "bignumber.js";

export async function getWalletTokenAccount(
  connection: Connection,
  wallet: PublicKey
): Promise<TokenAccount[]> {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data)
  }));
}

export function getATAAddress(
  programId: PublicKey,
  owner: PublicKey,
  mint: PublicKey
) {
  const { publicKey, nonce } = findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );
  return { publicKey, nonce };
}

export const xWeiAmount = (amount: number, decimals: number) => {
  return new BN(
    new BigNumber(amount.toString() + "e" + decimals.toString()).toFixed(0)
  );
};

export function randomDivide(amount: number, holders: number): number[] {
  // Generate random values for each holder
  const randomValues = Array.from({ length: holders }, () => Math.random());

  // Normalize the random values to sum to 1
  const total = randomValues.reduce((acc, val) => acc + val, 0);
  const normalizedValues = randomValues.map((val) => val / total);

  // Divide the amount according to the normalized values
  const dividedAmounts = normalizedValues.map((val) => amount * val);

  return dividedAmounts;
}
