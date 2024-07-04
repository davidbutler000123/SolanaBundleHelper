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
exports.createAndSendBundle = void 0;
const web3_js_1 = require("@solana/web3.js");
const searcher_1 = require("jito-ts/dist/sdk/block-engine/searcher");
const types_1 = require("jito-ts/dist/sdk/block-engine/types");
const bs58_1 = __importDefault(require("bs58"));
const errors_1 = require("../errors");
const util_1 = require("../utils/util");
const sign_tx_1 = require("./sign-tx");
const { getTipAccount, sendBundle, getBundleStatuses } = require('./json-rpc')

function createAndSendBundle(connection, bundleTranasction, payer, jitoBlockEngine, fee) {
    return __awaiter(this, void 0, void 0, function* () {
        // const searcher = (0, searcher_1.searcherClient)(jitoBlockEngine, jitoAuther);
        let txnConfirmResult = false;
        let breakCheckTransactionStatus = false;
        let jitoRpcUrl = 'https://' + String(jitoBlockEngine) + '/api/v1/bundles'
        try {
            const blockhash = (yield connection.getLatestBlockhash("finalized"))
                .blockhash;
            const realForBundle = [];
            for (let i = 0; i < bundleTranasction.length; i++) {
                bundleTranasction[i].txn.message.recentBlockhash = (yield connection.getLatestBlockhash("finalized")).blockhash;
                (0, sign_tx_1.signTransaction)(bundleTranasction[i]);
                realForBundle.push(bundleTranasction[i].txn);
            }
            let bundleTx = new types_1.Bundle(realForBundle, 5);
            if (payer) {
                // const tipAccount = new web3_js_1.PublicKey((yield searcher.getTipAccounts())[0]);
                const tipAccount = new web3_js_1.PublicKey(yield getTipAccount(jitoRpcUrl));
                bundleTx.addTipTx(payer, fee * web3_js_1.LAMPORTS_PER_SOL, tipAccount, blockhash);
            }            
            // console.log("Send");
            let bundleId = yield sendBundle(jitoRpcUrl, bundleTx)
            let bundleState = yield getBundleStatuses(jitoRpcUrl, bundleId)
            if(bundleState && bundleState.bundleId && bundleState.bundleId == bundleId) {
                breakCheckTransactionStatus = true
                if(bundleState.confirmation_status == 'confirmed' ||
                    bundleState.confirmation_status == 'finalized'
                ) txnConfirmResult = true
                else txnConfirmResult = false
            }
            // console.log("Finish send");
            setTimeout(() => {
                breakCheckTransactionStatus = true;
            }, 20000);
            const txnHash = bs58_1.default.encode(realForBundle[realForBundle.length - 1].signatures[0]);
            // console.log(txnHash);
            while (!breakCheckTransactionStatus) {
                yield (0, util_1.sleep)(1000);
                try {
                    const result = yield connection.getSignatureStatus(txnHash, {
                        searchTransactionHistory: true
                    });
                    if (result && result.value && result.value.confirmationStatus) {
                        txnConfirmResult = true;
                        breakCheckTransactionStatus = true;
                    }
                }
                catch (error) {
                    txnConfirmResult = false;
                    breakCheckTransactionStatus = false;
                }
            }
            if (txnConfirmResult) {
                return true;
            }
            else {
                throw new errors_1.TransactionExecuteError(`Bundle Error: failed`);
            }
        }
        catch (error) {
            throw new errors_1.TransactionExecuteError(`Bundle Error: ${error}`);
        }
    });
}
exports.createAndSendBundle = createAndSendBundle;
