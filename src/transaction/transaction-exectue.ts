import { Connection, Keypair } from "@solana/web3.js";
import { TransactionInfo } from "../instructions/build-instruction";
import { TransactionExecuteError } from "../errors";
import { setTransactionBudget } from "../utils/budget";
import { confirmTx, sendTx } from "./execute-rpc";
import { createAndSendBundle } from "./bundle";
import { connect } from "http2";

export enum ExectuerStatus {
  EXE_STATUS_NONE,
  EXE_STATUS_RUN,
  EXE_STATUS_CONFIRM,
  EXE_STATUS_END
}

export class TransactionExecuter {
  private status = ExectuerStatus.EXE_STATUS_NONE;
  private error: TransactionExecuteError | undefined = undefined;
  private usingBundle = false;
  private transactions: TransactionInfo[];
  private priorityFee = 0;
  private jitoFee = 0.001;
  private jitoAuther: Keypair | undefined;
  private jitoFeepair: Keypair | undefined;
  private connection: Connection;
  private jitoBlockEngine: string | undefined;

  constructor(
    connection: Connection,
    usingBundle: boolean,
    transactions: TransactionInfo[],
    priorityFee?: number,
    jitoFee?: number,
    jitoFeePayer?: Keypair | undefined,
    jitoAuther?: Keypair,
    jitoBlockEngine?: string
  ) {
    this.connection = connection;
    this.usingBundle = usingBundle;
    this.transactions = transactions;
    this.priorityFee = priorityFee ? priorityFee : 0;
    this.jitoFee = jitoFee ? jitoFee : 0.001;
    this.status = ExectuerStatus.EXE_STATUS_NONE;
    this.error = undefined;
    this.jitoFeepair = jitoFeePayer ? jitoFeePayer : undefined;
    this.jitoAuther = jitoAuther ? jitoAuther : undefined;
    this.jitoBlockEngine = jitoBlockEngine ? jitoBlockEngine : undefined;
  }

  public setExecuterStatus(status: ExectuerStatus) {
    this.status = status;
  }

  public getExecuterStatus() {
    return this.status;
  }

  public setExecuterError(error: TransactionExecuteError | undefined) {
    this.error = error;
  }

  public getExecuterError() {
    return this.error;
  }

  public async run() {
    if (this.usingBundle) {
      await this.executeBundle();
    } else {
      await this.executeWithRpc();
    }
  }

  public async executeBundle() {
    try {
      this.setExecuterStatus(ExectuerStatus.EXE_STATUS_RUN);
      await createAndSendBundle(
        this.connection,
        this.transactions,
        this.jitoFeepair!,
        this.jitoBlockEngine!,
        this.jitoAuther!,
        this.jitoFee
      );
      this.setExecuterError(undefined);
      this.setExecuterStatus(ExectuerStatus.EXE_STATUS_END);
    } catch (error) {
      console.log(error);
      if (error instanceof TransactionExecuteError) {
        this.setExecuterError(error);
      } else {
        this.setExecuterError(new TransactionExecuteError(`Unknown: ${error}`));
      }
      this.setExecuterStatus(ExectuerStatus.EXE_STATUS_END);
    }
  }

  public async executeWithRpc() {
    try {
      this.setExecuterStatus(ExectuerStatus.EXE_STATUS_RUN);
      if (this.priorityFee) {
        const priorityTransactions = await setTransactionBudget(
          this.connection,
          this.transactions,
          this.priorityFee
        );

        if (priorityTransactions) {
          this.transactions = [...priorityTransactions];
        }
      }

      for (const tx of this.transactions) {
        this.setExecuterStatus(ExectuerStatus.EXE_STATUS_RUN);
        const txId = await sendTx(this.connection, tx);
        console.log("TxId:", txId);
        this.setExecuterStatus(ExectuerStatus.EXE_STATUS_CONFIRM);
        if (txId) {
          await confirmTx(this.connection, txId);
        }
      }
      this.setExecuterError(undefined);
      this.setExecuterStatus(ExectuerStatus.EXE_STATUS_END);
    } catch (error) {
      this.setExecuterStatus(ExectuerStatus.EXE_STATUS_END);
      if (error instanceof TransactionExecuteError) {
        this.setExecuterError(error);
      } else {
        console.log(error);
        this.setExecuterError(new TransactionExecuteError(`Unknown: ${error}`));
      }
    }
  }
}
