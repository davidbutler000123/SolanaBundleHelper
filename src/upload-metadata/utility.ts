import fs from "fs";

export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true; // File exists
  } catch (error) {
    return false; // File doesn't exist
  }
}
