/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair } from "@solana/web3.js";
import { TransactionInfo } from "../instructions/build-instruction";
export declare function createAndSendBundle(connection: Connection, bundleTranasction: TransactionInfo[], payer: Keypair, jitoBlockEngine: string, fee: number): Promise<boolean>;
