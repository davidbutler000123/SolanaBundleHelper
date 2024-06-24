/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { ComputeBudgetConfig } from "@raydium-io/raydium-sdk";
import { TransactionInfo } from "../instructions/build-instruction";
import { Connection } from "@solana/web3.js";
export declare const sell_remove_fees = 5000000;
export declare function getComputeBudgetConfig(): Promise<ComputeBudgetConfig | undefined>;
export declare function getComputeBudgetConfigHigh(): Promise<ComputeBudgetConfig | undefined>;
export declare function getLamports(decimal: number): number;
export declare function setTransactionBudget(connection: Connection, transactions: TransactionInfo[], tip: number): Promise<TransactionInfo[] | undefined>;
