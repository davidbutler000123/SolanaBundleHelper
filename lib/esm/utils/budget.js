var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import { AddressLookupTableAccount, ComputeBudgetProgram, LAMPORTS_PER_SOL, TransactionMessage } from "@solana/web3.js";
import { SetTxPriorityError } from "../errors";
export const sell_remove_fees = 5000000;
export function getComputeBudgetConfig() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios.get("https://solanacompass.com/api/fees");
        const json = response.data;
        const { avg } = (_a = json === null || json === void 0 ? void 0 : json[15]) !== null && _a !== void 0 ? _a : {};
        if (!avg)
            return undefined; // fetch error
        return {
            units: 600000,
            microLamports: Math.min(Math.ceil((avg * 1000000) / 600000), 25000)
        };
    });
}
export function getComputeBudgetConfigHigh() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios.get("https://solanacompass.com/api/fees");
        const json = response.data;
        const { avg } = (_a = json === null || json === void 0 ? void 0 : json[15]) !== null && _a !== void 0 ? _a : {};
        if (!avg)
            return undefined; // fetch error
        return {
            units: sell_remove_fees,
            microLamports: Math.min(Math.ceil((avg * 1000000) / 600000), 25000)
        };
    });
}
export function getLamports(decimal) {
    return Math.pow(10, decimal);
}
export function setTransactionBudget(connection, transactions, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txs = [...transactions];
            const tipInst = ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: tip * LAMPORTS_PER_SOL
            });
            for (const tx of txs) {
                const addressLookupTableAccounts = yield Promise.all(tx.txn.message.addressTableLookups.map((lookup) => __awaiter(this, void 0, void 0, function* () {
                    return new AddressLookupTableAccount({
                        key: lookup.accountKey,
                        state: AddressLookupTableAccount.deserialize(yield connection
                            .getAccountInfo(lookup.accountKey)
                            .then((res) => res.data))
                    });
                })));
                const message = TransactionMessage.decompile(tx.txn.message, {
                    addressLookupTableAccounts: addressLookupTableAccounts
                });
                message.instructions.push(tipInst);
                tx.txn.message = message.compileToV0Message(addressLookupTableAccounts);
            }
            return [...txs];
        }
        catch (error) {
            throw new SetTxPriorityError(`SetTxPriorityError: ${error}`);
        }
    });
}
