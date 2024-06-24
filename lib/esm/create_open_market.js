var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { EnvironmentManager, SPL_ERROR } from "./global";
import { InstructionType, MARKET_STATE_LAYOUT_V2, Token, TxVersion, buildSimpleTransaction, generatePubKey, splitTxAndSigners, struct, u16, u32, u64, u8 } from "@raydium-io/raydium-sdk";
import { TOKEN_PROGRAM_ID, createInitializeAccountInstruction, getMint } from "@solana/spl-token";
import BN from "bn.js";
import * as transactions from "./transaction-helper/transaction";
function makeCreateMarketInstruction(_a) {
    return __awaiter(this, arguments, void 0, function* ({ connection, wallet, baseInfo, quoteInfo, lotSize, // 1
    tickSize, // 0.01
    dexProgramId, makeTxVersion, lookupTableCache }) {
        const market = generatePubKey({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const requestQueue = generatePubKey({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const eventQueue = generatePubKey({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const bids = generatePubKey({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const asks = generatePubKey({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const baseVault = generatePubKey({
            fromPublicKey: wallet,
            programId: TOKEN_PROGRAM_ID
        });
        const quoteVault = generatePubKey({
            fromPublicKey: wallet,
            programId: TOKEN_PROGRAM_ID
        });
        const feeRateBps = 0;
        const quoteDustThreshold = new BN(100);
        function getVaultOwnerAndNonce() {
            const vaultSignerNonce = new BN(0);
            while (true) {
                try {
                    const vaultOwner = PublicKey.createProgramAddressSync([
                        market.publicKey.toBuffer(),
                        vaultSignerNonce.toArrayLike(Buffer, "le", 8)
                    ], dexProgramId);
                    return { vaultOwner, vaultSignerNonce };
                }
                catch (e) {
                    vaultSignerNonce.iaddn(1);
                    if (vaultSignerNonce.gt(new BN(25555)))
                        throw Error("find vault owner error");
                }
            }
        }
        function initializeMarketInstruction({ programId, marketInfo }) {
            const dataLayout = struct([
                u8("version"),
                u32("instruction"),
                u64("baseLotSize"),
                u64("quoteLotSize"),
                u16("feeRateBps"),
                u64("vaultSignerNonce"),
                u64("quoteDustThreshold")
            ]);
            const keys = [
                { pubkey: marketInfo.id, isSigner: false, isWritable: true },
                { pubkey: marketInfo.requestQueue, isSigner: false, isWritable: true },
                { pubkey: marketInfo.eventQueue, isSigner: false, isWritable: true },
                { pubkey: marketInfo.bids, isSigner: false, isWritable: true },
                { pubkey: marketInfo.asks, isSigner: false, isWritable: true },
                { pubkey: marketInfo.baseVault, isSigner: false, isWritable: true },
                { pubkey: marketInfo.quoteVault, isSigner: false, isWritable: true },
                { pubkey: marketInfo.baseMint, isSigner: false, isWritable: false },
                { pubkey: marketInfo.quoteMint, isSigner: false, isWritable: false },
                // Use a dummy address if using the new dex upgrade to save tx space.
                {
                    pubkey: marketInfo.authority
                        ? marketInfo.quoteMint
                        : SYSVAR_RENT_PUBKEY,
                    isSigner: false,
                    isWritable: false
                }
            ]
                .concat(marketInfo.authority
                ? { pubkey: marketInfo.authority, isSigner: false, isWritable: false }
                : [])
                .concat(marketInfo.authority && marketInfo.pruneAuthority
                ? {
                    pubkey: marketInfo.pruneAuthority,
                    isSigner: false,
                    isWritable: false
                }
                : []);
            const data = Buffer.alloc(dataLayout.span);
            dataLayout.encode({
                version: 0,
                instruction: 0,
                baseLotSize: marketInfo.baseLotSize,
                quoteLotSize: marketInfo.quoteLotSize,
                feeRateBps: marketInfo.feeRateBps,
                vaultSignerNonce: marketInfo.vaultSignerNonce,
                quoteDustThreshold: marketInfo.quoteDustThreshold
            }, data);
            return new TransactionInstruction({
                keys,
                programId,
                data
            });
        }
        const { vaultOwner, vaultSignerNonce } = getVaultOwnerAndNonce();
        const ZERO = new BN(0);
        const baseLotSize = new BN(Math.round(Math.pow(10, baseInfo.decimals) * lotSize));
        const quoteLotSize = new BN(Math.round(lotSize * Math.pow(10, quoteInfo.decimals) * tickSize));
        if (baseLotSize.eq(ZERO))
            throw Error("lot size is too small");
        if (quoteLotSize.eq(ZERO))
            throw Error("tick size or lot size is too small");
        const ins1 = [];
        const accountLamports = yield connection.getMinimumBalanceForRentExemption(165);
        ins1.push(SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: baseVault.seed,
            newAccountPubkey: baseVault.publicKey,
            lamports: accountLamports,
            space: 165,
            programId: TOKEN_PROGRAM_ID
        }), SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: quoteVault.seed,
            newAccountPubkey: quoteVault.publicKey,
            lamports: accountLamports,
            space: 165,
            programId: TOKEN_PROGRAM_ID
        }), createInitializeAccountInstruction(baseVault.publicKey, baseInfo.mint, vaultOwner), createInitializeAccountInstruction(quoteVault.publicKey, quoteInfo.mint, vaultOwner));
        const EVENT_QUEUE_ITEMS = 128; // Default: 2978
        const REQUEST_QUEUE_ITEMS = 63; // Default: 63
        const ORDERBOOK_ITEMS = 201; // Default: 909
        const eventQueueSpace = EVENT_QUEUE_ITEMS * 88 + 44 + 48;
        const requestQueueSpace = REQUEST_QUEUE_ITEMS * 80 + 44 + 48;
        const orderBookSpace = ORDERBOOK_ITEMS * 80 + 44 + 48;
        const ins2 = [];
        ins2.push(SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: market.seed,
            newAccountPubkey: market.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(MARKET_STATE_LAYOUT_V2.span),
            space: MARKET_STATE_LAYOUT_V2.span,
            programId: dexProgramId
        }), SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: requestQueue.seed,
            newAccountPubkey: requestQueue.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(requestQueueSpace),
            space: requestQueueSpace,
            programId: dexProgramId
        }), SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: eventQueue.seed,
            newAccountPubkey: eventQueue.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(eventQueueSpace),
            space: eventQueueSpace,
            programId: dexProgramId
        }), SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: bids.seed,
            newAccountPubkey: bids.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(orderBookSpace),
            space: orderBookSpace,
            programId: dexProgramId
        }), SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: asks.seed,
            newAccountPubkey: asks.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(orderBookSpace),
            space: orderBookSpace,
            programId: dexProgramId
        }), initializeMarketInstruction({
            programId: dexProgramId,
            marketInfo: {
                id: market.publicKey,
                requestQueue: requestQueue.publicKey,
                eventQueue: eventQueue.publicKey,
                bids: bids.publicKey,
                asks: asks.publicKey,
                baseVault: baseVault.publicKey,
                quoteVault: quoteVault.publicKey,
                baseMint: baseInfo.mint,
                quoteMint: quoteInfo.mint,
                baseLotSize: baseLotSize,
                quoteLotSize: quoteLotSize,
                feeRateBps: feeRateBps,
                vaultSignerNonce: vaultSignerNonce,
                quoteDustThreshold: quoteDustThreshold
            }
        }));
        const ins = {
            address: {
                marketId: market.publicKey,
                requestQueue: requestQueue.publicKey,
                eventQueue: eventQueue.publicKey,
                bids: bids.publicKey,
                asks: asks.publicKey,
                baseVault: baseVault.publicKey,
                quoteVault: quoteVault.publicKey,
                baseMint: baseInfo.mint,
                quoteMint: quoteInfo.mint
            },
            innerTransactions: [
                {
                    instructions: ins1,
                    signers: [],
                    instructionTypes: [
                        InstructionType.createAccount,
                        InstructionType.createAccount,
                        InstructionType.initAccount,
                        InstructionType.initAccount
                    ]
                },
                {
                    instructions: ins2,
                    signers: [],
                    instructionTypes: [
                        InstructionType.createAccount,
                        InstructionType.createAccount,
                        InstructionType.createAccount,
                        InstructionType.createAccount,
                        InstructionType.createAccount,
                        InstructionType.initMarket
                    ]
                }
            ]
        };
        return {
            address: ins.address,
            innerTransactions: yield splitTxAndSigners({
                connection,
                makeTxVersion,
                computeBudgetConfig: undefined,
                payer: wallet,
                innerTransaction: ins.innerTransactions,
                lookupTableCache
            })
        };
    });
}
export const createOpenBookMarket = (connection_1, token_owner_1, token_address_1, ...args_1) => __awaiter(void 0, [connection_1, token_owner_1, token_address_1, ...args_1], void 0, function* (connection, token_owner, token_address, min_order_size = 1, tick_size = 0.01) {
    if (token_owner.publicKey.toBase58().length <= 0 ||
        token_address.length <= 0) {
        console.log("Error: [Create Open Book Market] invalid argument for create open book market");
        return SPL_ERROR.E_INVALID_ARGUE;
    }
    try {
        const token_mint = new PublicKey(token_address);
        const mint_info = yield getMint(connection, token_mint);
        const base_token = new Token(TOKEN_PROGRAM_ID, token_address, mint_info.decimals);
        const quote_token_info = EnvironmentManager.getQuoteTokenInfo();
        const quote_token = new Token(TOKEN_PROGRAM_ID, quote_token_info.address, quote_token_info.decimal, quote_token_info.symbol, quote_token_info.name);
        console.log("[Create Open Book Market]<--------------------make marekt instruction");
        const { innerTransactions, address } = yield makeCreateMarketInstruction({
            connection: connection,
            wallet: token_owner.publicKey,
            baseInfo: base_token,
            quoteInfo: quote_token,
            lotSize: min_order_size,
            tickSize: tick_size,
            dexProgramId: EnvironmentManager.getProgramID().OPENBOOK_MARKET,
            makeTxVersion: TxVersion.V0,
            lookupTableCache: EnvironmentManager.getCacheLTA()
        });
        console.log("[Create Open Book Market]<--------------------create simple transaction");
        const txns = yield buildSimpleTransaction({
            connection: connection,
            makeTxVersion: TxVersion.V0,
            payer: token_owner.publicKey,
            innerTransactions: innerTransactions,
            addLookupTableInfo: EnvironmentManager.getCacheLTA()
        });
        console.log("[Create Open Book Market]<--------------------send and confirm transaction");
        const txn_result = yield transactions.sendAndConfirmTransactionsWithCheck(connection, token_owner, txns);
        if (txn_result !== SPL_ERROR.E_OK) {
            console.error("Error: [Create Open Book Market] failed to send and confirm transaction");
            return SPL_ERROR.E_FAIL;
        }
    }
    catch (error) {
        console.error("Error: [Create Open Book Market] error occured: ", error);
        return SPL_ERROR.E_FAIL;
    }
    console.log("Success: [Create Open Book Market] Success to create open book market id");
    return SPL_ERROR.E_OK;
});
