const axios = require('axios');
const bs58 = require('bs58')

async function getTipAccount(url) {
    let tipAccount = '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'
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
            console.log('getTipAccount-> result = ' + tipAccount)
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
            console.log(error.toString())
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