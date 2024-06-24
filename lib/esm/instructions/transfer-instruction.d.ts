/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { PublicKey } from "@solana/web3.js";
export declare const generateTransferInst: (sender: PublicKey, fromAccount: PublicKey, toAccount: PublicKey, ca: PublicKey, amount: number, decimal: number) => import("@solana/web3.js").TransactionInstruction;
