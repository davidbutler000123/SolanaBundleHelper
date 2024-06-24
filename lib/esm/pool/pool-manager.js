var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Liquidity, Percent, Token, TokenAmount } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";
export class PoolManager {
    constructor(poolKey) {
        this.poolKey = poolKey;
        this.baseToken = new Token(TOKEN_PROGRAM_ID, poolKey.baseMint, poolKey.baseDecimals);
        this.quoteToken = new Token(TOKEN_PROGRAM_ID, poolKey.quoteMint, poolKey.quoteDecimals);
        this.poolInfo = {
            baseDecimals: poolKey.baseDecimals,
            quoteDecimals: poolKey.baseDecimals,
            baseReserve: new BN(0),
            quoteReserve: new BN(0)
        };
    }
    computeSolOut(baseIn) {
        return Liquidity.computeAmountOut({
            poolKeys: this.poolKey,
            poolInfo: this.poolInfo,
            amountIn: new TokenAmount(this.baseToken, baseIn, true),
            currencyOut: this.quoteToken,
            slippage: new Percent(1, 100)
        });
    }
    computeSolIn(baseAmount) {
        return Liquidity.computeAmountIn({
            poolKeys: this.poolKey,
            poolInfo: this.poolInfo,
            amountOut: new TokenAmount(this.baseToken, baseAmount, true),
            currencyIn: this.quoteToken,
            slippage: new Percent(1, 100)
        });
    }
    updateWithReverse(baseReserve, quoteReserve) {
        this.poolInfo = Object.assign(Object.assign({}, this.poolInfo), { baseReserve: baseReserve, quoteReserve: quoteReserve });
    }
    updateWithReal(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.poolInfo = yield Liquidity.fetchInfo({
                    connection,
                    poolKeys: this.poolKey
                });
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    getPoolInfo() {
        return this.poolInfo;
    }
}
