/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair } from "@solana/web3.js";
import { TransactionInfo } from "../instructions/build-instruction";
import { TransactionExecuteError } from "../errors";
export declare enum ExectuerStatus {
    EXE_STATUS_NONE = 0,
    EXE_STATUS_RUN = 1,
    EXE_STATUS_CONFIRM = 2,
    EXE_STATUS_END = 3
}
export declare class TransactionExecuter {
    private status;
    private error;
    private usingBundle;
    private transactions;
    private priorityFee;
    private jitoFee;
    private jitoAuther;
    private jitoFeepair;
    private connection;
    private jitoBlockEngine;
    constructor(connection: Connection, usingBundle: boolean, transactions: TransactionInfo[], priorityFee?: number, jitoFee?: number, jitoFeePayer?: Keypair | undefined, jitoAuther?: Keypair, jitoBlockEngine?: string);
    setExecuterStatus(status: ExectuerStatus): void;
    getExecuterStatus(): ExectuerStatus;
    setExecuterError(error: TransactionExecuteError | undefined): void;
    getExecuterError(): TransactionExecuteError | undefined;
    run(): Promise<void>;
    executeBundle(): Promise<void>;
    executeWithRpc(): Promise<void>;
}
