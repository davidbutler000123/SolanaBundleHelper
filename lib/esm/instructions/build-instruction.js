var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { BuildInstructionError } from "../errors";
import { LOOKUP_TABLE_CACHE, TxVersion, buildSimpleTransaction } from "@raydium-io/raydium-sdk";
export const compileInstToVersioned = (connection, payer, insts, signer, lookupAddr) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recentBlockhash = (yield connection.getLatestBlockhash("finalized"))
            .blockhash;
        if (lookupAddr) {
            const lookupTableAccount = (yield connection.getAddressLookupTable(new PublicKey(lookupAddr))).value;
            const txn = new VersionedTransaction(new TransactionMessage({
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
            const txn = new VersionedTransaction(new TransactionMessage({
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
        throw new BuildInstructionError(`CompileInstToVersioned: ${error}`);
    }
});
export const buildInstToVersioned = (connection, payer, inst) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const txn = yield buildSimpleTransaction({
            connection,
            makeTxVersion: TxVersion.V0,
            payer: payer.publicKey,
            innerTransactions: inst,
            recentBlockhash: (yield connection.getLatestBlockhash("finalized"))
                .blockhash,
            addLookupTableInfo: LOOKUP_TABLE_CACHE
        });
        return txn;
    }
    catch (error) {
        throw new BuildInstructionError(`BuildInstToVersioned: ${error}`);
    }
});
