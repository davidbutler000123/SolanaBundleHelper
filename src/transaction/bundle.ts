import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey
} from "@solana/web3.js";
import { TransactionInfo } from "../instructions/build-instruction";
import { searcherClient } from "jito-ts/dist/sdk/block-engine/searcher";
import { Bundle } from "jito-ts/dist/sdk/block-engine/types";
import base58 from "bs58";
import { TransactionExecuteError } from "../errors";
import { sleep } from "../utils/util";
import { signTransaction } from "./sign-tx";

export async function createAndSendBundle(
  connection: Connection,
  bundleTranasction: TransactionInfo[],
  payer: Keypair,
  jitoBlockEngine: string,
  jitoAuther: Keypair,
  fee: number
) {
  const searcher = searcherClient(jitoBlockEngine, jitoAuther);

  let txnConfirmResult: boolean = false;
  let breakCheckTransactionStatus: boolean = false;

  try {
    const blockhash = (await connection.getLatestBlockhash("finalized"))
      .blockhash;
    const realForBundle: any[] = [];
    for (let i = 0; i < bundleTranasction.length; i++) {
      bundleTranasction[i].txn.message.recentBlockhash = (
        await connection.getLatestBlockhash("finalized")
      ).blockhash;
      signTransaction(bundleTranasction[i]);
      realForBundle.push(bundleTranasction[i].txn);
    }

    let bundleTx = new Bundle(realForBundle, 5);
    if (payer) {
      const tipAccount = new PublicKey((await searcher.getTipAccounts())[0]);
      bundleTx.addTipTx(payer, fee * LAMPORTS_PER_SOL, tipAccount, blockhash);
    }

    searcher.onBundleResult(
      async (bundleResult: any) => {
        console.log(bundleResult);

        if (bundleResult.rejected) {
          try {
            if (
              bundleResult.rejected.simulationFailure.msg.includes(
                "custom program error"
              ) ||
              bundleResult.rejected.simulationFailure.msg.includes(
                "Error processing Instruction"
              )
            ) {
              breakCheckTransactionStatus = true;
            } else if (
              bundleResult.rejected.simulationFailure.msg.includes(
                "This transaction has already been processed"
              ) ||
              bundleResult.rejected.droppedBundle.msg.includes(
                "Bundle partially processed"
              )
            ) {
              txnConfirmResult = true;
              breakCheckTransactionStatus = true;
            }
          } catch (error) {}
        }
      },
      (error) => {
        breakCheckTransactionStatus = false;
      }
    );

    console.log("Send");
    await searcher.sendBundle(bundleTx);
    console.log("Finish send");
    setTimeout(() => {
      breakCheckTransactionStatus = true;
    }, 20000);

    const txnHash = base58.encode(
      realForBundle[realForBundle.length - 1].signatures[0]
    );

    console.log(txnHash);
    while (!breakCheckTransactionStatus) {
      await sleep(1000);
      try {
        const result = await connection.getSignatureStatus(txnHash, {
          searchTransactionHistory: true
        });
        if (result && result.value && result.value.confirmationStatus) {
          txnConfirmResult = true;
          breakCheckTransactionStatus = true;
        }
      } catch (error) {
        txnConfirmResult = false;
        breakCheckTransactionStatus = false;
      }
    }

    if (txnConfirmResult) {
      return true;
    } else {
      throw new TransactionExecuteError(`Bundle Error: failed`);
    }
  } catch (error) {
    throw new TransactionExecuteError(`Bundle Error: ${error}`);
  }
}
