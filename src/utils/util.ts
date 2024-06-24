import { Connection, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

import { promisify } from "util";

// Promisify fs.mkdir and fs.exists
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

/**
 * Creates a directory if it doesn't already exist.
 * @param dirPath - The path of the directory to create.
 * @returns A Promise that resolves to true if the directory was created or already exists, and false if there was an error.
 */
export async function createDirectory(dirPath: string): Promise<boolean> {
  try {
    const exists = await existsAsync(dirPath);
    if (!exists) {
      await mkdirAsync(dirPath, { recursive: true });
    }
    return true;
  } catch (err) {
    return false;
  }
}

// Promisify fs.writeFile to use it with async/await
const writeFileAsync = promisify(fs.writeFile);

/**
 * Writes a JSON string to a file.
 * @param filePath - The path of the file to write.
 * @param jsonString - The JSON string to write to the file.
 * @returns A Promise that resolves to true if the write was successful, and false if there was an error.
 */
export async function writeJsonToFile(
  filePath: string,
  jsonString: string
): Promise<boolean> {
  try {
    await writeFileAsync(filePath, jsonString, "utf8");
    return true;
  } catch (err) {
    return false;
  }
}

// Promisify fs.readFile
const readFileAsync = promisify(fs.readFile);

/**
 * Reads a JSON file and parses it into an object.
 * @param filePath - The path of the JSON file to read.
 * @returns A Promise that resolves to the parsed object if successful, or null if there was an error.
 */
export async function readJsonFile(filePath: string): Promise<any | null> {
  try {
    const data = await readFileAsync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading or parsing JSON file:", err);
    return null;
  }
}

export function generateWallets(counts: number = 1) {
  const wallets: Keypair[] = [];

  for (let i = 0; i < counts; i++) {
    wallets.push(Keypair.generate());
  }

  return [...wallets];
}

export function divideArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    result.push(chunk);
  }

  return result;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function waitForNewBlock(connection: Connection, targetHeight: number) {
  console.log(`Waiting for ${targetHeight} new blocks`);
  return new Promise(async (resolve: any) => {
    // Get the last valid block height of the blockchain
    const { lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Set an interval to check for new blocks every 1000ms
    const intervalId = setInterval(async () => {
      // Get the new valid block height
      const { lastValidBlockHeight: newValidBlockHeight } =
        await connection.getLatestBlockhash();
      // console.log(newValidBlockHeight)

      // Check if the new valid block height is greater than the target block height
      if (newValidBlockHeight > lastValidBlockHeight + targetHeight) {
        // If the target block height is reached, clear the interval and resolve the promise
        clearInterval(intervalId);
        resolve();
      }
    }, 1000);
  });
}
