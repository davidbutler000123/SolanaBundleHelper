"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.createAndSendBundle = void 0;
const web3_js_1 = require("@solana/web3.js");
const searcher_1 = require("jito-ts/dist/sdk/block-engine/searcher");
const global_1 = require("./global");
const types_1 = require("jito-ts/dist/sdk/block-engine/types");
const utils = __importStar(require("./utility"));
const transaction_1 = require("./transaction-helper/transaction");
const createAndSendBundle = (connection, bundleTip, transactions, payer) => __awaiter(void 0, void 0, void 0, function* () {
    const searcher = (0, searcher_1.searcherClient)(global_1.EnvironmentManager.getJitoBlockEngine(), global_1.EnvironmentManager.getJitoKeypair());
    const _tipAccount = (yield searcher.getTipAccounts())[0];
    const tipAccount = new web3_js_1.PublicKey(_tipAccount);
    const recentBlockhash = (yield connection.getLatestBlockhash("finalized"))
        .blockhash;
    const bundleTransactions = [];
    for (let i = 0; i < transactions.length; i++) {
        transactions[i].txn.message.recentBlockhash = recentBlockhash;
        (0, transaction_1.signTransaction)(transactions[i].signer, transactions[i].txn);
        bundleTransactions.push(transactions[i].txn);
    }
    let bundleTx = new types_1.Bundle(bundleTransactions, 5);
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
            return global_1.SPL_ERROR.E_OK;
        else
            return global_1.SPL_ERROR.E_FAIL;
    }
    catch (error) {
        console.error("Bundle Error: ", error);
        return global_1.SPL_ERROR.E_FAIL;
    }
});
exports.createAndSendBundle = createAndSendBundle;
