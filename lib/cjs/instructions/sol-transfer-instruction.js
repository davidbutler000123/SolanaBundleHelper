"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSolTransferInst = void 0;
const web3_js_1 = require("@solana/web3.js");
const generateSolTransferInst = (from, to, amount) => {
    return web3_js_1.SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: Math.floor(amount * web3_js_1.LAMPORTS_PER_SOL)
    });
};
exports.generateSolTransferInst = generateSolTransferInst;
