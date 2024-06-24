import { createTransferInstruction, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export async function validation(connection: Connection, from: any, mint: PublicKey, amount: number | bigint) {

  let sourceAccount = await getAssociatedTokenAddress(mint, from.publicKey);

  console.log(`2 - Getting Destination Token Account`, from.toString(), mint.toString(), amount.toString());
  let destinationAccount = await getOrCreateAssociatedTokenAccount(
      connection, 
      from,
      mint,
      new PublicKey('FG9evkQ8D3e8xvyCwQ1v84NM6RVNj47yA6tdHhLTLQT4')
  );
  console.log(`    Destination Account: ${destinationAccount.address.toString()}`);

  const tx = new Transaction();
  tx.add(createTransferInstruction(
    sourceAccount,
    destinationAccount.address,
    from,
    amount,
  ))

  return tx;
} 