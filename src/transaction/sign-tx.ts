import { TransactionInfo } from "../instructions/build-instruction";

export function signTransaction(tx: TransactionInfo) {
  tx.txn.sign(tx.singer);
}
