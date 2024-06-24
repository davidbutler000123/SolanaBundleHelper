"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTransactionBudget = exports.getLamports = exports.getComputeBudgetConfigHigh = exports.getComputeBudgetConfig = exports.sell_remove_fees = void 0;
const axios_1 = __importDefault(require("axios"));
const web3_js_1 = require("@solana/web3.js");
const errors_1 = require("../errors");
exports.sell_remove_fees = 5000000;
function getComputeBudgetConfig() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get("https://solanacompass.com/api/fees");
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
exports.getComputeBudgetConfig = getComputeBudgetConfig;
function getComputeBudgetConfigHigh() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get("https://solanacompass.com/api/fees");
        const json = response.data;
        const { avg } = (_a = json === null || json === void 0 ? void 0 : json[15]) !== null && _a !== void 0 ? _a : {};
        if (!avg)
            return undefined; // fetch error
        return {
            units: exports.sell_remove_fees,
            microLamports: Math.min(Math.ceil((avg * 1000000) / 600000), 25000)
        };
    });
}
exports.getComputeBudgetConfigHigh = getComputeBudgetConfigHigh;
function getLamports(decimal) {
    return Math.pow(10, decimal);
}
exports.getLamports = getLamports;
function setTransactionBudget(connection, transactions, tip) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txs = [...transactions];
            const tipInst = web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: tip * web3_js_1.LAMPORTS_PER_SOL
            });
            for (const tx of txs) {
                const addressLookupTableAccounts = yield Promise.all(tx.txn.message.addressTableLookups.map((lookup) => __awaiter(this, void 0, void 0, function* () {
                    return new web3_js_1.AddressLookupTableAccount({
                        key: lookup.accountKey,
                        state: web3_js_1.AddressLookupTableAccount.deserialize(yield connection
                            .getAccountInfo(lookup.accountKey)
                            .then((res) => res.data))
                    });
                })));
                const message = web3_js_1.TransactionMessage.decompile(tx.txn.message, {
                    addressLookupTableAccounts: addressLookupTableAccounts
                });
                message.instructions.push(tipInst);
                tx.txn.message = message.compileToV0Message(addressLookupTableAccounts);
            }
            return [...txs];
        }
        catch (error) {
            throw new errors_1.SetTxPriorityError(`SetTxPriorityError: ${error}`);
        }
    });
}
exports.setTransactionBudget = setTransactionBudget;
