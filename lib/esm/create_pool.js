var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PublicKey } from "@solana/web3.js";
import { EnvironmentManager, SPL_ERROR } from "./global";
import { TOKEN_PROGRAM_ID, getMint } from "@solana/spl-token";
import { Liquidity, Token, TxVersion, buildSimpleTransaction } from "@raydium-io/raydium-sdk";
import { Market } from "@project-serum/serum";
import * as utiles from "./utility";
import { BN } from "bn.js";
export const createPool = (connection, token_owner, token_address, input_token_amount, input_quote_amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (token_address.length <= 0) {
            console.log("Error: [Create Pool] invalid argument for create pool");
            return { result: SPL_ERROR.E_INVALID_ARGUE, value: undefined };
        }
        console.log("<---------------------[Create Pool]-----------------------");
        const token_mint = new PublicKey(token_address);
        const mint_info = yield getMint(connection, token_mint);
        const base_token = new Token(TOKEN_PROGRAM_ID, token_address, mint_info.decimals);
        const quote_token_info = EnvironmentManager.getQuoteTokenInfo();
        const quote_token = new Token(TOKEN_PROGRAM_ID, quote_token_info.address, quote_token_info.decimal, quote_token_info.symbol, quote_token_info.name);
        const accounts = yield Market.findAccountsByMints(connection, base_token.mint, quote_token.mint, EnvironmentManager.getProgramID().OPENBOOK_MARKET);
        if (accounts.length === 0) {
            throw "Get market account failed";
        }
        console.log("Market Found");
        const market_id = accounts[0].publicKey;
        const start_time = Math.floor(Date.now() / 1000);
        const base_amount = utiles.xWeiAmount(input_token_amount, base_token.decimals);
        const quote_amount = utiles.xWeiAmount(input_quote_amount, quote_token.decimals);
        const wallet_token_accounts = yield utiles.getWalletAccounts(connection, token_owner.publicKey);
        if (!wallet_token_accounts || wallet_token_accounts.length <= 0) {
            throw "Get wallet account failed";
        }
        const { innerTransactions, address } = yield Liquidity.makeCreatePoolV4InstructionV2Simple({
            connection: connection,
            programId: EnvironmentManager.getProgramID().AmmV4,
            marketInfo: {
                marketId: market_id,
                programId: EnvironmentManager.getProgramID().OPENBOOK_MARKET
            },
            baseMintInfo: base_token,
            quoteMintInfo: quote_token,
            baseAmount: base_amount,
            quoteAmount: quote_amount,
            startTime: new BN(start_time),
            ownerInfo: {
                feePayer: token_owner.publicKey,
                wallet: token_owner.publicKey,
                tokenAccounts: wallet_token_accounts,
                useSOLBalance: true
            },
            makeTxVersion: TxVersion.V0,
            associatedOnly: false,
            checkCreateATAOwner: true,
            feeDestinationId: EnvironmentManager.getFeeDestinationId()
        });
        const txns = yield buildSimpleTransaction({
            connection: connection,
            makeTxVersion: TxVersion.V0,
            payer: token_owner.publicKey,
            innerTransactions: innerTransactions,
            addLookupTableInfo: EnvironmentManager.getCacheLTA(),
            recentBlockhash: (yield connection.getLatestBlockhash()).blockhash
        });
        console.log("Success: [Create Pool] made transaction successfully");
        return { result: SPL_ERROR.E_OK, value: txns };
    }
    catch (error) {
        console.error("Error: [Create Pool] err: ", error);
        return { result: SPL_ERROR.E_FAIL, value: undefined };
    }
});
