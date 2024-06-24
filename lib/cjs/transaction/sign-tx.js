"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTransaction = void 0;
function signTransaction(tx) {
    tx.txn.sign(tx.singer);
}
exports.signTransaction = signTransaction;
