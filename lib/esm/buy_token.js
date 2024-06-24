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
import { Liquidity, Token, TokenAmount, TxVersion, buildSimpleTransaction } from "@raydium-io/raydium-sdk";
import { getWalletAccounts } from "./utility";
export const buyToken = (connection, buyer, token_address, base_amount, quote_amount, pool_key) => __awaiter(void 0, void 0, void 0, function* () {
    if (token_address.length <= 0 || base_amount <= 0) {
        console.error("Error: [Buy Token] invalid argument iput!!!");
        return { result: SPL_ERROR.E_INVALID_ARGUE, value: undefined };
    }
    try {
        const token_mint = new PublicKey(token_address);
        const token_info = yield getMint(connection, token_mint);
        const base_token = new Token(TOKEN_PROGRAM_ID, token_address, token_info.decimals);
        const quote_info = EnvironmentManager.getQuoteTokenInfo();
        const quote_token = new Token(TOKEN_PROGRAM_ID, quote_info.address, quote_info.decimal, quote_info.symbol, quote_info.name);
        const base_token_amount = new TokenAmount(base_token, base_amount, false);
        const quote_token_amount = new TokenAmount(quote_token, quote_amount, false);
        const wallet_token_accounts = yield getWalletAccounts(connection, buyer.publicKey);
        const { innerTransactions } = yield Liquidity.makeSwapInstructionSimple({
            connection: connection,
            poolKeys: pool_key,
            userKeys: {
                tokenAccounts: wallet_token_accounts,
                owner: buyer.publicKey
            },
            amountIn: quote_token_amount,
            amountOut: base_token_amount,
            fixedSide: "in",
            makeTxVersion: TxVersion.V0
        });
        const transactions = yield buildSimpleTransaction({
            connection: connection,
            makeTxVersion: TxVersion.V0,
            payer: buyer.publicKey,
            innerTransactions: innerTransactions,
            addLookupTableInfo: EnvironmentManager.getCacheLTA(),
            recentBlockhash: (yield connection.getLatestBlockhash()).blockhash
        });
        return { result: SPL_ERROR.E_OK, value: transactions };
    }
    catch (error) {
        console.error("Error: [buy Tokens] error code: ", error);
        return { result: SPL_ERROR.E_FAIL, value: undefined };
    }
});
