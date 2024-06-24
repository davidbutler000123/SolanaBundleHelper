import {
  Liquidity,
  ONE,
  TxVersion,
  parseBigNumberish
} from "@raydium-io/raydium-sdk";
import { Connection, Keypair, TokenAmount } from "@solana/web3.js";
import { getWalletTokenAccount } from "../utils/get-balance";
import { getComputeBudgetConfigHigh } from "../utils/budget";
import { GenerateTransactionError } from "../errors";

export const generateBuyInst = async (
  connection: Connection,
  poolKeys: any,
  buyer: Keypair,
  inputTokenAmount: any,
  minAmountOut: any,
  maxLamports: number = 100000
): Promise<any> => {
  try {
    const tokenAccountInfos = await getWalletTokenAccount(
      connection,
      buyer.publicKey
    );

    const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
      connection: connection,
      poolKeys: { ...poolKeys },
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
  } catch (error) {
    throw new GenerateTransactionError(`GenereateBuyInst: ${error}`);
  }
};
