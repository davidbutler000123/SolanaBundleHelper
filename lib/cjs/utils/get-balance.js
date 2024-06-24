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
exports.randomDivide = exports.xWeiAmount = exports.getATAAddress = exports.getWalletTokenAccount = void 0;
const web3_js_1 = require("@solana/web3.js");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const bn_js_1 = __importDefault(require("bn.js"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
function getWalletTokenAccount(connection, wallet) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletTokenAccount = yield connection.getTokenAccountsByOwner(wallet, {
            programId: raydium_sdk_1.TOKEN_PROGRAM_ID
        });
        return walletTokenAccount.value.map((i) => ({
            pubkey: i.pubkey,
            programId: i.account.owner,
            accountInfo: raydium_sdk_1.SPL_ACCOUNT_LAYOUT.decode(i.account.data)
        }));
    });
}
exports.getWalletTokenAccount = getWalletTokenAccount;
function getATAAddress(programId, owner, mint) {
    const { publicKey, nonce } = (0, raydium_sdk_1.findProgramAddress)([owner.toBuffer(), programId.toBuffer(), mint.toBuffer()], new web3_js_1.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"));
    return { publicKey, nonce };
}
exports.getATAAddress = getATAAddress;
const xWeiAmount = (amount, decimals) => {
    return new bn_js_1.default(new bignumber_js_1.default(amount.toString() + "e" + decimals.toString()).toFixed(0));
};
exports.xWeiAmount = xWeiAmount;
function randomDivide(amount, holders) {
    // Generate random values for each holder
    const randomValues = Array.from({ length: holders }, () => Math.random());
    // Normalize the random values to sum to 1
    const total = randomValues.reduce((acc, val) => acc + val, 0);
    const normalizedValues = randomValues.map((val) => val / total);
    // Divide the amount according to the normalized values
    const dividedAmounts = normalizedValues.map((val) => amount * val);
    return dividedAmounts;
}
exports.randomDivide = randomDivide;
