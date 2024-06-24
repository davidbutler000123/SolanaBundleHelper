/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair } from "@solana/web3.js";
import { BUNDLE_TRANSACTION, SPL_ERROR } from "./global";
export declare const createAndSendBundle: (connection: Connection, bundleTip: number, transactions: BUNDLE_TRANSACTION[], payer: Keypair) => Promise<SPL_ERROR>;
