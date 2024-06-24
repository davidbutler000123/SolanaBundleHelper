/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
export declare function validation(connection: Connection, from: any, mint: PublicKey, amount: number | bigint): Promise<Transaction>;
