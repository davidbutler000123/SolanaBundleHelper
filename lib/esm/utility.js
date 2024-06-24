var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import BN from "bn.js";
import * as fs from "fs";
import BigNumber from "bignumber.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { EnvironmentManager } from "./global";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Liquidity, SPL_ACCOUNT_LAYOUT, findProgramAddress } from "@raydium-io/raydium-sdk";
import { MARKET_STATE_LAYOUT_V3 } from "@project-serum/serum";
export function checkFileExists(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.promises.access(filePath, fs.constants.F_OK);
            return true; // File exists
        }
        catch (error) {
            return false; // File doesn't exist
        }
    });
}
export const xWeiAmount = (amount, decimals) => {
    return new BN(new BigNumber(amount.toString() + "e" + decimals.toString()).toFixed(0));
};
export const getConnection = (commitment) => {
    return new Connection(EnvironmentManager.getRpcNetUrl(), commitment);
};
export const getWalletAccounts = (connection, wallet) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet_token_account = yield connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID
    });
    return wallet_token_account.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data)
    }));
});
export const getAvailablePoolKeyAndPoolInfo = (connection, baseToken, quoteToken, marketAccounts) => __awaiter(void 0, void 0, void 0, function* () {
    let bFound = false;
    let count = 0;
    let poolKeys;
    let poolInfo;
    while (bFound === false && count < marketAccounts.length) {
        const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccounts[count].accountInfo.data);
        poolKeys = Liquidity.getAssociatedPoolKeys({
            version: 4,
            marketVersion: 3,
            baseMint: baseToken.mint,
            quoteMint: quoteToken.mint,
            baseDecimals: baseToken.decimals,
            quoteDecimals: quoteToken.decimals,
            marketId: marketAccounts[count].publicKey,
            programId: EnvironmentManager.getProgramID().AmmV4,
            marketProgramId: EnvironmentManager.getProgramID().OPENBOOK_MARKET
        });
        poolKeys.marketBaseVault = marketInfo.baseVault;
        poolKeys.marketQuoteVault = marketInfo.quoteVault;
        poolKeys.marketBids = marketInfo.bids;
        poolKeys.marketAsks = marketInfo.asks;
        poolKeys.marketEventQueue = marketInfo.eventQueue;
        try {
            poolInfo = yield Liquidity.fetchInfo({
                connection: connection,
                poolKeys: poolKeys
            });
            bFound = true;
            console.log("Success to get pool infos...");
        }
        catch (error) {
            bFound = false;
            poolInfo = undefined;
            poolKeys = undefined;
            console.log("Failed to get pool infos...");
        }
        count++;
    }
    return {
        poolKeys: poolKeys,
        poolInfo: poolInfo
    };
});
export function getATAAddress(programId, owner, mint) {
    const { publicKey, nonce } = findProgramAddress([owner.toBuffer(), programId.toBuffer(), mint.toBuffer()], new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"));
    return { publicKey, nonce };
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
