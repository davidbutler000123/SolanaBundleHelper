/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
export declare const generateCreateAltInst: (connection: Connection, payer: Keypair) => Promise<any>;
export declare const generateExtendAltInst: (connection: Connection, payer: Keypair, lookupTableAddress: any, addresses: PublicKey[]) => import("@solana/web3.js").TransactionInstruction;
