import {
  Connection,
  SendOptions,
  TransactionConfirmationStrategy
} from "@solana/web3.js";
import { TransactionInfo } from "../instructions/build-instruction";
import { signTransaction } from "./sign-tx";
import { TransactionExecuteError } from "../errors";

export async function sendTx(
  connection: Connection,
  tx: TransactionInfo,
  option?: SendOptions
): Promise<string> {
  try {
    tx.txn.message.recentBlockhash = (
      await connection.getLatestBlockhash("finalized")
    ).blockhash;
    signTransaction(tx);
    return await connection.sendTransaction(tx.txn, option);
  } catch (error) {
    throw new TransactionExecuteError(`sendTx: ${error}`);
  }
}

export async function confirmTx(connection: Connection, txId: string) {
  try {
    await connection.confirmTransaction({
      signature: txId,
      abortSignal: AbortSignal.timeout(60000)
    } as TransactionConfirmationStrategy);
  } catch (error) {
    throw new TransactionExecuteError(`confirmTx: ${error}`);
  }
}
