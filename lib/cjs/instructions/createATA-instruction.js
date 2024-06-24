"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreateAccountTransactionInst = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const getCreateAccountTransactionInst = (payer, wallet, addr) => {
    const associatedToken = (0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(addr), wallet.publicKey, true, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
    return (0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, associatedToken, wallet.publicKey, new web3_js_1.PublicKey(addr), spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
};
exports.getCreateAccountTransactionInst = getCreateAccountTransactionInst;
