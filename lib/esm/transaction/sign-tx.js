export function signTransaction(tx) {
    tx.txn.sign(tx.singer);
}
