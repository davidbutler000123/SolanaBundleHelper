import {
  AddressLookupTableProgram,
  Connection,
  Keypair,
  PublicKey
} from "@solana/web3.js";
import { GenerateTransactionError } from "../errors";

export const generateCreateAltInst = async (
  connection: Connection,
  payer: Keypair
): Promise<any> => {
  try {
    return AddressLookupTableProgram.createLookupTable({
      authority: payer.publicKey,
      payer: payer.publicKey,
      recentSlot: await connection.getSlot()
    });
  } catch (error) {
    throw new GenerateTransactionError(`GenerateCreateAltInst: ${error}`);
  }
};

export const generateExtendAltInst = (
  connection: Connection,
  payer: Keypair,
  lookupTableAddress: any,
  addresses: PublicKey[]
) => {
  try {
    return AddressLookupTableProgram.extendLookupTable({
      payer: payer.publicKey,
      authority: payer.publicKey,
      lookupTable: lookupTableAddress,
      addresses: addresses
    });
  } catch (error) {
    throw new GenerateTransactionError(`GenerateExtendAltInst: ${error}`);
  }
};
