/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair } from "@solana/web3.js";
export declare const generateBuyInst: (connection: Connection, poolKeys: any, buyer: Keypair, inputTokenAmount: any, minAmountOut: any, maxLamports?: number) => Promise<any>;
