import { ComputeBudgetConfig } from "@raydium-io/raydium-sdk";
import axios from "axios";
import { TransactionInfo } from "../instructions/build-instruction";
import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  TransactionMessage
} from "@solana/web3.js";
import { SetTxPriorityError } from "../errors";

interface SolanaFeeInfo {
  min: number;
  max: number;
  avg: number;
  priorityTx: number;
  nonVotes: number;
  priorityRatio: number;
  avgCuPerBlock: number;
  blockspaceUsageRatio: number;
}

type SolanaFeeInfoJson = {
  "1": SolanaFeeInfo;
  "5": SolanaFeeInfo;
  "15": SolanaFeeInfo;
};

export const sell_remove_fees = 5000000;

export async function getComputeBudgetConfig(): Promise<
  ComputeBudgetConfig | undefined
> {
  const response = await axios.get<SolanaFeeInfoJson>(
    "https://solanacompass.com/api/fees"
  );
  const json = response.data;
  const { avg } = json?.[15] ?? {};
  if (!avg) return undefined; // fetch error
  return {
    units: 600000,
    microLamports: Math.min(Math.ceil((avg * 1000000) / 600000), 25000)
  } as ComputeBudgetConfig;
}

export async function getComputeBudgetConfigHigh(): Promise<
  ComputeBudgetConfig | undefined
> {
  const response = await axios.get<SolanaFeeInfoJson>(
    "https://solanacompass.com/api/fees"
  );
  const json = response.data;
  const { avg } = json?.[15] ?? {};
  if (!avg) return undefined; // fetch error
  return {
    units: sell_remove_fees,
    microLamports: Math.min(Math.ceil((avg * 1000000) / 600000), 25000)
  } as ComputeBudgetConfig;
}

export function getLamports(decimal: number) {
  return 10 ** decimal;
}

export async function setTransactionBudget(
  connection: Connection,
  transactions: TransactionInfo[],
  tip: number
): Promise<TransactionInfo[] | undefined> {
  try {
    const txs = [...transactions];
    const tipInst = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: tip * LAMPORTS_PER_SOL
    });

    for (const tx of txs) {
      const addressLookupTableAccounts = await Promise.all(
        tx.txn.message.addressTableLookups.map(async (lookup) => {
          return new AddressLookupTableAccount({
            key: lookup.accountKey,
            state: AddressLookupTableAccount.deserialize(
              await connection
                .getAccountInfo(lookup.accountKey)
                .then((res) => res!.data)
            )
          });
        })
      );

      const message = TransactionMessage.decompile(tx.txn.message, {
        addressLookupTableAccounts: addressLookupTableAccounts
      });

      message.instructions.push(tipInst);

      tx.txn.message = message.compileToV0Message(addressLookupTableAccounts);
    }

    return [...txs];
  } catch (error) {
    throw new SetTxPriorityError(`SetTxPriorityError: ${error}`);
  }
}
