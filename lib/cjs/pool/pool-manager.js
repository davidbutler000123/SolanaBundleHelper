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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolManager = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const spl_token_1 = require("@solana/spl-token");
const bn_js_1 = __importDefault(require("bn.js"));
class PoolManager {
    constructor(poolKey) {
        this.poolKey = poolKey;
        this.baseToken = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, poolKey.baseMint, poolKey.baseDecimals);
        this.quoteToken = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, poolKey.quoteMint, poolKey.quoteDecimals);
        this.poolInfo = {
            baseDecimals: poolKey.baseDecimals,
            quoteDecimals: poolKey.baseDecimals,
            baseReserve: new bn_js_1.default(0),
            quoteReserve: new bn_js_1.default(0)
        };
    }
    computeSolOut(baseIn) {
        return raydium_sdk_1.Liquidity.computeAmountOut({
            poolKeys: this.poolKey,
            poolInfo: this.poolInfo,
            amountIn: new raydium_sdk_1.TokenAmount(this.baseToken, baseIn, true),
            currencyOut: this.quoteToken,
            slippage: new raydium_sdk_1.Percent(1, 100)
        });
    }
    computeSolIn(baseAmount) {
        return raydium_sdk_1.Liquidity.computeAmountIn({
            poolKeys: this.poolKey,
            poolInfo: this.poolInfo,
            amountOut: new raydium_sdk_1.TokenAmount(this.baseToken, baseAmount, true),
            currencyIn: this.quoteToken,
            slippage: new raydium_sdk_1.Percent(1, 100)
        });
    }
    updateWithReverse(baseReserve, quoteReserve) {
        this.poolInfo = Object.assign(Object.assign({}, this.poolInfo), { baseReserve: baseReserve, quoteReserve: quoteReserve });
    }
    updateWithReal(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.poolInfo = yield raydium_sdk_1.Liquidity.fetchInfo({
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
exports.PoolManager = PoolManager;
