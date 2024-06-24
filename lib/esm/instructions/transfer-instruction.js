import { createTransferCheckedInstruction } from "@solana/spl-token";
export const generateTransferInst = (sender, fromAccount, toAccount, ca, amount, decimal) => {
    const txn = createTransferCheckedInstruction(fromAccount, ca, toAccount, sender, amount, decimal);
    return txn;
};
