import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction
} from "@solana/web3.js";
import { searcherClient } from "jito-ts/dist/sdk/block-engine/searcher";
import { BUNDLE_TRANSACTION, EnvironmentManager, SPL_ERROR } from "./global";
import { Bundle } from "jito-ts/dist/sdk/block-engine/types";
import * as utils from "./utility";
import { signTransaction } from "./transaction-helper/transaction";

export const createAndSendBundle = async (
  connection: Connection,
  bundleTip: number,
  transactions: BUNDLE_TRANSACTION[],
  payer: Keypair
): Promise<SPL_ERROR> => {
  const searcher = searcherClient(
    EnvironmentManager.getJitoBlockEngine(),
    EnvironmentManager.getJitoKeypair()
  );

  const _tipAccount = (await searcher.getTipAccounts())[0];
  const tipAccount = new PublicKey(_tipAccount);
  const recentBlockhash = (await connection.getLatestBlockhash("finalized"))
    .blockhash;
  const bundleTransactions: VersionedTransaction[] = [];

  for (let i = 0; i < transactions.length; i++) {
    transactions[i].txn.message.recentBlockhash = recentBlockhash;
    signTransaction(transactions[i].signer, transactions[i].txn);
    bundleTransactions.push(transactions[i].txn);
  }

  let bundleTx = new Bundle(bundleTransactions, 5);

  bundleTx.addTipTx(payer, bundleTip, tipAccount, recentBlockhash);

  try {
    searcher.onBundleResult(
      (bundleResult) => {
        if (bundleResult.bundleId === bundleUUID) {
          if (bundleResult.accepted) {
            console.log(
              bundleResult.accepted,
              `Bundle ${bundleResult.bundleId} accepted in slot ${bundleResult.accepted.slot}`
            );
          }

          if (bundleResult.rejected) {
            console.log(
              bundleResult.rejected,
              `Bundle ${bundleResult.bundleId} rejected:`
            );

            checked = true;
            if (
              bundleResult.rejected.droppedBundle?.msg.includes("processed") ||
              bundleResult.rejected.simulationFailure?.msg?.includes(
                "processed"
              )
            ) {
              success = true;
            } else {
              success = false;
            }
          }

          if (bundleResult.processed) {
            console.log(`Bundle ${bundleResult.bundleId} processed`);
            checked = true;
            success = true;
          }
        }
      },
      (error) => {
        console.error("Bundle Error: ", error);
        success = false;
        checked = true;
      }
    );

    const bundleUUID = await searcher.sendBundle(bundleTx);
    console.log("bundle id: ", bundleUUID);
    let checked = false;
    let success = false;

    while (!checked) {
      await utils.sleep(1000);
    }

    if (success) return SPL_ERROR.E_OK;
    else return SPL_ERROR.E_FAIL;
  } catch (error) {
    console.error("Bundle Error: ", error);
    return SPL_ERROR.E_FAIL;
  }
};
