var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PublicKey } from "@solana/web3.js";
import { searcherClient } from "jito-ts/dist/sdk/block-engine/searcher";
import { EnvironmentManager, SPL_ERROR } from "./global";
import { Bundle } from "jito-ts/dist/sdk/block-engine/types";
import * as utils from "./utility";
import { signTransaction } from "./transaction-helper/transaction";
export const createAndSendBundle = (connection, bundleTip, transactions, payer) => __awaiter(void 0, void 0, void 0, function* () {
    const searcher = searcherClient(EnvironmentManager.getJitoBlockEngine(), EnvironmentManager.getJitoKeypair());
    const _tipAccount = (yield searcher.getTipAccounts())[0];
    const tipAccount = new PublicKey(_tipAccount);
    const recentBlockhash = (yield connection.getLatestBlockhash("finalized"))
        .blockhash;
    const bundleTransactions = [];
    for (let i = 0; i < transactions.length; i++) {
        transactions[i].txn.message.recentBlockhash = recentBlockhash;
        signTransaction(transactions[i].signer, transactions[i].txn);
        bundleTransactions.push(transactions[i].txn);
    }
    let bundleTx = new Bundle(bundleTransactions, 5);
    bundleTx.addTipTx(payer, bundleTip, tipAccount, recentBlockhash);
    try {
        searcher.onBundleResult((bundleResult) => {
            var _a, _b, _c;
            if (bundleResult.bundleId === bundleUUID) {
                if (bundleResult.accepted) {
                    console.log(bundleResult.accepted, `Bundle ${bundleResult.bundleId} accepted in slot ${bundleResult.accepted.slot}`);
                }
                if (bundleResult.rejected) {
                    console.log(bundleResult.rejected, `Bundle ${bundleResult.bundleId} rejected:`);
                    checked = true;
                    if (((_a = bundleResult.rejected.droppedBundle) === null || _a === void 0 ? void 0 : _a.msg.includes("processed")) ||
                        ((_c = (_b = bundleResult.rejected.simulationFailure) === null || _b === void 0 ? void 0 : _b.msg) === null || _c === void 0 ? void 0 : _c.includes("processed"))) {
                        success = true;
                    }
                    else {
                        success = false;
                    }
                }
                if (bundleResult.processed) {
                    console.log(`Bundle ${bundleResult.bundleId} processed`);
                    checked = true;
                    success = true;
                }
            }
        }, (error) => {
            console.error("Bundle Error: ", error);
            success = false;
            checked = true;
        });
        const bundleUUID = yield searcher.sendBundle(bundleTx);
        console.log("bundle id: ", bundleUUID);
        let checked = false;
        let success = false;
        while (!checked) {
            yield utils.sleep(1000);
        }
        if (success)
            return SPL_ERROR.E_OK;
        else
            return SPL_ERROR.E_FAIL;
    }
    catch (error) {
        console.error("Bundle Error: ", error);
        return SPL_ERROR.E_FAIL;
    }
});
