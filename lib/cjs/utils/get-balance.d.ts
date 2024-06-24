/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, PublicKey } from "@solana/web3.js";
import { TokenAccount } from "@raydium-io/raydium-sdk";
import BN from "bn.js";
export declare function getWalletTokenAccount(connection: Connection, wallet: PublicKey): Promise<TokenAccount[]>;
export declare function getATAAddress(programId: PublicKey, owner: PublicKey, mint: PublicKey): {
    publicKey: PublicKey;
    nonce: number;
};
export declare const xWeiAmount: (amount: number, decimals: number) => BN;
export declare function randomDivide(amount: number, holders: number): number[];
