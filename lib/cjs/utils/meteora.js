const { 
    meteoassert_sp,
    getProviderWList 
} = require("./util");
const {
    PublicKey,
    Keypair,
    LAMPORTS_PER_SOL
} = require('@solana/web3.js')
const base58 = require("bs58");
const BN = require('bn.js');
const AmmImpl = require('../../../../../src/amm');
const { compileInstToVersioned } = require("web3-bundle-helpers.js/lib/cjs/instructions/build-instruction");
const { NATIVE_MINT } = require("@solana/spl-token");
async function bundleForBuyTxn(
    connection,
    inTxn,
    meteoPoolKeys
) { 
    try {
        const resultTxns = []
        resultTxns.push(inTxn)

        const wlts = await getProviderWList();
        if(!wlts || wlts.length < 1) return
        const w1 = Keypair.fromSecretKey(base58.decode(wlts[0].private))

        let liqAmount = Number(process.env.QUOTE_DEPOSIT_AMOUNT)
        let amount = await connection.getBalance( w1.publicKey );
        if(amount * 0.9 / LAMPORTS_PER_SOL >= 0.016) {            
            const swapTx = await AmmImpl.default.swapWithAccounts(
                connection,
                w1.publicKey,
                NATIVE_MINT,
                new BN(amount * 0.9),
                new BN(1),
                meteoPoolKeys
            );
            const swapVer = await compileInstToVersioned(connection, w1, swapTx.instructions, [w1])
            resultTxns.push(swapVer.txn)
        }
        
        return {
            zipTxns: resultTxns,
            zipSigners: [w1]
        }
    } catch (error) {
        
    }
    return null
}
exports.bundleForBuyTxn = bundleForBuyTxn;

function bundleForCreatePool(tokenCA, txns) {
    meteoassert_sp(tokenCA)
    return txns
}
exports.bundleForCreatePool = bundleForCreatePool;