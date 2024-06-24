/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair, Signer, Transaction, VersionedTransaction } from "@solana/web3.js";
export interface TransactionInfo {
    txn: VersionedTransaction;
    singer: (Keypair | Signer)[];
}
export declare const compileInstToVersioned: (connection: Connection, payer: Keypair, insts: any[], signer: (Keypair | Signer)[], lookupAddr?: string) => Promise<TransactionInfo | undefined>;
export declare const buildInstToVersioned: (connection: Connection, payer: Keypair, inst: any) => Promise<(VersionedTransaction | Transaction)[]>;
