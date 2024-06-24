"use strict";
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
function divideArrayIntoChunks(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
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
