"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransferInst = void 0;
const spl_token_1 = require("@solana/spl-token");
const generateTransferInst = (sender, fromAccount, toAccount, ca, amount, decimal) => {
    const txn = (0, spl_token_1.createTransferCheckedInstruction)(fromAccount, ca, toAccount, sender, amount, decimal);
    return txn;
};
exports.generateTransferInst = generateTransferInst;
