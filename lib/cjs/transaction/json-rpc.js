const axios = require('axios');
const bs58 = require('bs58')
const util_1 = require("../utils/util");

const jitoTipAccounts = [
    'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
    'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
    '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
    'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
    'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
    'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
    '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
    'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY'
  ]

async function getTipAccount(url) {
    let tipAccount = 'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe'
    let rndIndex = Math.floor(Math.random() * jitoTipAccounts.length)
    tipAccount = jitoTipAccounts[rndIndex]
    return tipAccount
    let executeResult = false
    let retryCount = 0
    while(!executeResult) {
        try {
            const response = await axios.post(url, {
                jsonrpc: '2.0',
                id: 1,
                method: 'getTipAccounts',
                params: [],
            })            
            if(response.data && response.data.result && response.data.result.length > 0) {
                let rndIndex = Math.floor(Math.random() * response.data.result.length)
                tipAccount = response.data.result[rndIndex]
                executeResult = true
            }
            retryCount++
            if(retryCount > 10) break
        } catch (error) {
            console.log(error.toString())
        }
    }
    return tipAccount
}
exports.getTipAccount = getTipAccount

async function sendBundle(url, bundleTx) {
    if(!bundleTx.transactions || bundleTx.transactions.length == 0) return

    let serializedTxns = []
    for(let i = 0; i < bundleTx.transactions.length; i++) {
        const txn = bundleTx.transactions[i]
        serializedTxns.push(bs58.encode(txn.serialize()))
    }
    
    let bundlId = ''
    let executeResult = false
    let retryCount = 0
    while(!executeResult) {
        try {
            const response = await axios.post(url, {
                jsonrpc: '2.0',
                id: 1,
                method: 'sendBundle',
                params: [serializedTxns],
            })
            if(response.data) {
                executeResult = true
                bundlId = response.data.result
            }
            console.log('sendBundle-> response.data = ')
            console.log(response.data)
            retryCount++
            if(retryCount > 10) break
        } catch (error) {
            // console.log(error.toString())
            await util_1.sleep(2000);
            break
        }
    }
    return bundlId
}
exports.sendBundle = sendBundle

async function getBundleStatuses(url, bundlId) {
    let resultValue = null
    let executeResult = false
    let retryCount = 0
    console.log('getBundleStatuses-> bundlId = ' + bundlId)
    while(!executeResult) {
        try {
            const response = await axios.post(url, {
                jsonrpc: '2.0',
                id: 1,
                method: 'getBundleStatuses',
                params: [[bundlId]],
            })
            // console.log('getBundleStatuses-> response.data = ')
            // console.log(response.data)
            if(response.data && response.data.result && response.data.result.value && response.data.result.value.length > 0) {
                resultValue = response.data.result.value[0]
                executeResult = true
            }
            retryCount++
            if(retryCount > 50) break
        } catch (error) {
            console.log(error.toString())
        }
    }
    return resultValue
}
exports.getBundleStatuses = getBundleStatuses