/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { ProgramId } from "@raydium-io/raydium-sdk";
export declare const generateCreatePoolInst: (connection: Connection, owner: Keypair, marketId: PublicKey, baseMint: PublicKey, quoteMint: PublicKey, baseDecimals: number, quoteDecimals: number, baseAmount: number, quoteAmount: number, programId?: ProgramId, delayTime?: number, feeDestinationId?: PublicKey) => Promise<any>;
