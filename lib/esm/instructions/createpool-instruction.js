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
import { Liquidity, MAINNET_PROGRAM_ID, TxVersion } from "@raydium-io/raydium-sdk";
import { getWalletTokenAccount, xWeiAmount } from "../utils/get-balance";
import { BN } from "bn.js";
import { GenerateTransactionError } from "../errors";
export const generateCreatePoolInst = (connection, owner, marketId, baseMint, quoteMint, baseDecimals, quoteDecimals, baseAmount, quoteAmount, programId = MAINNET_PROGRAM_ID, delayTime = 0, feeDestinationId = new PublicKey("7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5")) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenAccountInfos = yield getWalletTokenAccount(connection, owner.publicKey);
        const { innerTransactions } = yield Liquidity.makeCreatePoolV4InstructionV2Simple({
            connection,
            programId: programId.AmmV4,
            marketInfo: {
                programId: programId.OPENBOOK_MARKET,
                marketId: marketId
            },
            associatedOnly: false,
            ownerInfo: {
                feePayer: owner.publicKey,
                wallet: owner.publicKey,
                tokenAccounts: tokenAccountInfos,
                useSOLBalance: true
            },
            baseMintInfo: {
                mint: baseMint,
                decimals: baseDecimals
            },
            quoteMintInfo: {
                mint: quoteMint,
                decimals: quoteDecimals
            },
            startTime: new BN(Math.floor(Date.now() / 1000) + delayTime),
            baseAmount: xWeiAmount(baseAmount, baseDecimals),
            quoteAmount: xWeiAmount(quoteAmount, quoteDecimals),
            checkCreateATAOwner: true,
            makeTxVersion: TxVersion.V0,
            feeDestinationId: feeDestinationId
        });
        return innerTransactions;
    }
    catch (error) {
        throw new GenerateTransactionError(`GenerateCreatePoolInst: ${error}`);
    }
});
