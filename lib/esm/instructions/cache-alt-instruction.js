var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AddressLookupTableProgram } from "@solana/web3.js";
import { GenerateTransactionError } from "../errors";
export const generateCreateAltInst = (connection, payer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return AddressLookupTableProgram.createLookupTable({
            authority: payer.publicKey,
            payer: payer.publicKey,
            recentSlot: yield connection.getSlot()
        });
    }
    catch (error) {
        throw new GenerateTransactionError(`GenerateCreateAltInst: ${error}`);
    }
});
export const generateExtendAltInst = (connection, payer, lookupTableAddress, addresses) => {
    try {
        return AddressLookupTableProgram.extendLookupTable({
            payer: payer.publicKey,
            authority: payer.publicKey,
            lookupTable: lookupTableAddress,
            addresses: addresses
        });
    }
    catch (error) {
        throw new GenerateTransactionError(`GenerateExtendAltInst: ${error}`);
    }
};
