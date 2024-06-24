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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInstToVersioned = exports.compileInstToVersioned = void 0;
const web3_js_1 = require("@solana/web3.js");
const errors_1 = require("../errors");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const compileInstToVersioned = (connection, payer, insts, signer, lookupAddr) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recentBlockhash = (yield connection.getLatestBlockhash("finalized"))
            .blockhash;
        if (lookupAddr) {
            const lookupTableAccount = (yield connection.getAddressLookupTable(new web3_js_1.PublicKey(lookupAddr))).value;
            const txn = new web3_js_1.VersionedTransaction(new web3_js_1.TransactionMessage({
                payerKey: payer.publicKey,
                instructions: insts,
                recentBlockhash: recentBlockhash
            }).compileToV0Message([lookupTableAccount]));
            return {
                txn: txn,
                singer: signer
            };
        }
        else {
            const txn = new web3_js_1.VersionedTransaction(new web3_js_1.TransactionMessage({
                payerKey: payer.publicKey,
                instructions: insts,
                recentBlockhash: recentBlockhash
            }).compileToV0Message());
            return {
                txn: txn,
                singer: signer
            };
        }
    }
    catch (error) {
        throw new errors_1.BuildInstructionError(`CompileInstToVersioned: ${error}`);
    }
});
exports.compileInstToVersioned = compileInstToVersioned;
const buildInstToVersioned = (connection, payer, inst) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const txn = yield (0, raydium_sdk_1.buildSimpleTransaction)({
            connection,
            makeTxVersion: raydium_sdk_1.TxVersion.V0,
            payer: payer.publicKey,
            innerTransactions: inst,
            recentBlockhash: (yield connection.getLatestBlockhash("finalized"))
                .blockhash,
            addLookupTableInfo: raydium_sdk_1.LOOKUP_TABLE_CACHE
        });
        return txn;
    }
    catch (error) {
        throw new errors_1.BuildInstructionError(`BuildInstToVersioned: ${error}`);
    }
});
exports.buildInstToVersioned = buildInstToVersioned;
