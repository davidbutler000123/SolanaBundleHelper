import { Connection, Keypair, PublicKey, TokenAmount } from "@solana/web3.js";
import {
  LOOKUP_TABLE_CACHE,
  Liquidity,
  MAINNET_PROGRAM_ID,
  ProgramId,
  Token,
  TxVersion
} from "@raydium-io/raydium-sdk";
import { getWalletTokenAccount, xWeiAmount } from "../utils/get-balance";
import { BN } from "bn.js";
import { getComputeBudgetConfig } from "../utils/budget";
import { GenerateTransactionError } from "../errors";

export const generateCreatePoolInst = async (
  connection: Connection,
  owner: Keypair,
  marketId: PublicKey,
  baseMint: PublicKey,
  quoteMint: PublicKey,
  baseDecimals: number,
  quoteDecimals: number,
  baseAmount: number,
  quoteAmount: number,
  programId: ProgramId = MAINNET_PROGRAM_ID,
  delayTime: number = 0,
  feeDestinationId: PublicKey = new PublicKey(
    "7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5"
  )
): Promise<any> => {
  try {
    const tokenAccountInfos = await getWalletTokenAccount(
      connection,
      owner.publicKey
    );

    const { innerTransactions } =
      await Liquidity.makeCreatePoolV4InstructionV2Simple({
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
  } catch (error) {
    throw new GenerateTransactionError(`GenerateCreatePoolInst: ${error}`);
  }
};
