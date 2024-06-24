/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, SendOptions } from "@solana/web3.js";
import { TransactionInfo } from "../instructions/build-instruction";
export declare function sendTx(connection: Connection, tx: TransactionInfo, option?: SendOptions): Promise<string>;
export declare function confirmTx(connection: Connection, txId: string): Promise<void>;
