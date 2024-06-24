/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Keypair } from "@solana/web3.js";
export declare const getCreateAccountTransactionInst: (payer: Keypair, wallet: Keypair, addr: string) => import("@solana/web3.js").TransactionInstruction;
