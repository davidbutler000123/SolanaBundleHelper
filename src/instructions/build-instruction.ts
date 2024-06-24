import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import { BuildInstructionError } from "../errors";
import {
  LOOKUP_TABLE_CACHE,
  TxVersion,
  buildSimpleTransaction
} from "@raydium-io/raydium-sdk";

export interface TransactionInfo {
  txn: VersionedTransaction;
  singer: (Keypair | Signer)[];
}

export const compileInstToVersioned = async (
  connection: Connection,
  payer: Keypair,
  insts: any[],
  signer: (Keypair | Signer)[],
  lookupAddr?: string
): Promise<TransactionInfo | undefined> => {
  try {
    const recentBlockhash = (await connection.getLatestBlockhash("finalized"))
      .blockhash;
    if (lookupAddr) {
      const lookupTableAccount: any = (
        await connection.getAddressLookupTable(new PublicKey(lookupAddr))
      ).value;

      const txn = new VersionedTransaction(
        new TransactionMessage({
          payerKey: payer.publicKey,
          instructions: insts,
          recentBlockhash: recentBlockhash
        }).compileToV0Message([lookupTableAccount])
      );
      return {
        txn: txn,
        singer: signer
      };
    } else {
      const txn = new VersionedTransaction(
        new TransactionMessage({
          payerKey: payer.publicKey,
          instructions: insts,
          recentBlockhash: recentBlockhash
        }).compileToV0Message()
      );
      return {
        txn: txn,
        singer: signer
      };
    }
  } catch (error) {
    throw new BuildInstructionError(`CompileInstToVersioned: ${error}`);
  }
};

export const buildInstToVersioned = async (
  connection: Connection,
  payer: Keypair,
  inst: any
): Promise<(VersionedTransaction | Transaction)[]> => {
  try {
    const txn = await buildSimpleTransaction({
      connection,
      makeTxVersion: TxVersion.V0,
      payer: payer.publicKey,
      innerTransactions: inst,
      recentBlockhash: (await connection.getLatestBlockhash("finalized"))
        .blockhash,
      addLookupTableInfo: LOOKUP_TABLE_CACHE
    });

    return txn;
  } catch (error) {
    throw new BuildInstructionError(`BuildInstToVersioned: ${error}`);
  }
};
