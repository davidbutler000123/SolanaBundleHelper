import { 
    Connection, 
    PublicKey, 
    Keypair,
    Transaction,
    VersionedTransaction,
    TransactionMessage,
    SystemProgram,
    LAMPORTS_PER_SOL,
    TransactionInstruction,
    AddressLookupTableAccount
  } from '@solana/web3.js';
import {
    MeteoPoolKeys
} from '../../../../../src/global'

export declare const bundleForCreatePool: (tokenCA: string, txns: VersionedTransaction[]) => VersionedTransaction[];
export declare const bundleForBuyTxn: (
    connection: Connection, 
    inTxn: VersionedTransaction,
    meteoPoolKeys: MeteoPoolKeys
) => Promise<any>;