import { createTransferCheckedInstruction } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export const generateTransferInst = (
  sender: PublicKey,
  fromAccount: PublicKey,
  toAccount: PublicKey,
  ca: PublicKey,
  amount: number,
  decimal: number
) => {
  const txn = createTransferCheckedInstruction(
    fromAccount,
    ca,
    toAccount,
    sender,
    amount,
    decimal
  );

  return txn;
};
