var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Liquidity, TxVersion } from "@raydium-io/raydium-sdk";
import { getWalletTokenAccount } from "../utils/get-balance";
import { GenerateTransactionError } from "../errors";
export const generateBuyInst = (connection, poolKeys, buyer, inputTokenAmount, minAmountOut, maxLamports = 100000) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenAccountInfos = yield getWalletTokenAccount(connection, buyer.publicKey);
        const { innerTransactions } = yield Liquidity.makeSwapInstructionSimple({
            connection: connection,
            poolKeys: Object.assign({}, poolKeys),
            userKeys: {
                tokenAccounts: tokenAccountInfos,
                owner: buyer.publicKey
            },
            amountIn: inputTokenAmount,
            amountOut: minAmountOut,
            config: {
                bypassAssociatedCheck: false
            },
            fixedSide: "in",
            makeTxVersion: TxVersion.V0,
            computeBudgetConfig: {
                microLamports: maxLamports
            }
        });
        const instructions = innerTransactions[0].instructions.filter(Boolean);
        return instructions.slice(1);
    }
    catch (error) {
        throw new GenerateTransactionError(`GenereateBuyInst: ${error}`);
    }
});
