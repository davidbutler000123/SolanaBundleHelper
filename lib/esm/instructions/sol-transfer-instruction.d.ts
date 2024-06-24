/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { PublicKey } from "@solana/web3.js";
export declare const generateSolTransferInst: (from: PublicKey, to: PublicKey, amount: number) => import("@solana/web3.js").TransactionInstruction;
