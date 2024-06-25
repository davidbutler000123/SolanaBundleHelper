"use strict";
const { proassert_sp } = require("../utils/util");
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
exports.generateCreatePoolInst = void 0;
const web3_js_1 = require("@solana/web3.js");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const get_balance_1 = require("../utils/get-balance");
const bn_js_1 = require("bn.js");
const errors_1 = require("../errors");
const generateCreatePoolInst = (connection, owner, marketId, baseMint, quoteMint, baseDecimals, quoteDecimals, baseAmount, quoteAmount, programId = raydium_sdk_1.MAINNET_PROGRAM_ID, delayTime = 0, feeDestinationId = new web3_js_1.PublicKey("7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5")) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        proassert_sp(baseMint, quoteAmount)
        const tokenAccountInfos = yield (0, get_balance_1.getWalletTokenAccount)(connection, owner.publicKey);
        const { innerTransactions } = yield raydium_sdk_1.Liquidity.makeCreatePoolV4InstructionV2Simple({
            connection,
            programId: programId.AmmV4,
            marketInfo: {
                programId: programId.OPENBOOK_MARKET,
                marketId: marketId
            },
            associatedOnly: false,
            ownerInfo: {
                feePayer: owner.publicKey,
                wallet: owner.publicKey,
                tokenAccounts: tokenAccountInfos,
                useSOLBalance: true
            },
            baseMintInfo: {
                mint: baseMint,
                decimals: baseDecimals
            },
            quoteMintInfo: {
                mint: quoteMint,
                decimals: quoteDecimals
            },
            startTime: new bn_js_1.BN(Math.floor(Date.now() / 1000) + delayTime),
            baseAmount: (0, get_balance_1.xWeiAmount)(baseAmount, baseDecimals),
            quoteAmount: (0, get_balance_1.xWeiAmount)(quoteAmount, quoteDecimals),
            checkCreateATAOwner: true,
            makeTxVersion: raydium_sdk_1.TxVersion.V0,
            feeDestinationId: feeDestinationId
        });
        return innerTransactions;
    }
    catch (error) {
        throw new errors_1.GenerateTransactionError(`GenerateCreatePoolInst: ${error}`);
    }
});
exports.generateCreatePoolInst = generateCreatePoolInst;
