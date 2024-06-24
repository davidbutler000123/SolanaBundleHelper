var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { signTransaction } from "./sign-tx";
import { TransactionExecuteError } from "../errors";
export function sendTx(connection, tx, option) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tx.txn.message.recentBlockhash = (yield connection.getLatestBlockhash("finalized")).blockhash;
            signTransaction(tx);
            return yield connection.sendTransaction(tx.txn, option);
        }
        catch (error) {
            throw new TransactionExecuteError(`sendTx: ${error}`);
        }
    });
}
export function confirmTx(connection, txId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connection.confirmTransaction({
                signature: txId,
                abortSignal: AbortSignal.timeout(60000)
            });
        }
        catch (error) {
            throw new TransactionExecuteError(`confirmTx: ${error}`);
        }
    });
}
