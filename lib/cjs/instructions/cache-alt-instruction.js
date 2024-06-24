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
exports.generateExtendAltInst = exports.generateCreateAltInst = void 0;
const web3_js_1 = require("@solana/web3.js");
const errors_1 = require("../errors");
const generateCreateAltInst = (connection, payer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return web3_js_1.AddressLookupTableProgram.createLookupTable({
            authority: payer.publicKey,
            payer: payer.publicKey,
            recentSlot: yield connection.getSlot()
        });
    }
    catch (error) {
        throw new errors_1.GenerateTransactionError(`GenerateCreateAltInst: ${error}`);
    }
});
exports.generateCreateAltInst = generateCreateAltInst;
const generateExtendAltInst = (connection, payer, lookupTableAddress, addresses) => {
    try {
        return web3_js_1.AddressLookupTableProgram.extendLookupTable({
            payer: payer.publicKey,
            authority: payer.publicKey,
            lookupTable: lookupTableAddress,
            addresses: addresses
        });
    }
    catch (error) {
        throw new errors_1.GenerateTransactionError(`GenerateExtendAltInst: ${error}`);
    }
};
exports.generateExtendAltInst = generateExtendAltInst;
