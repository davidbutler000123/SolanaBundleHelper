import { Connection } from "@solana/web3.js";

import {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
  toMetaplexFile
} from "@metaplex-foundation/js";
import { checkFileExists } from "./utility";
import { UploadMetadataError } from "../errors";
import { readFileSync } from "fs";

export const uploadImageToMetaplex = async (
  metaplex: Metaplex,
  image: string
): Promise<string> => {
  let url = "";
  if ((await checkFileExists(image)) === false) {
    throw new UploadMetadataError("Upload file is not exist. Please check.");
  }
  try {
    const fileData = readFileSync(image);
    const metaplexFile = toMetaplexFile(fileData, "meme-logo.png");
    url = await metaplex.storage().upload(metaplexFile);
  } catch (error) {
    throw new UploadMetadataError("Failed to upload image to metaplex.");
  }

  return url;
};

/*
@metaplex: Metaplex which handle uploading
@metadata: upload metadata
*/

export const uploadMetaByMetaplex = async (
  metaplex: Metaplex,
  metadata: any
): Promise<string> => {
  let url = "";
  try {
    const { uri } = await metaplex.nfts().uploadMetadata(metadata);
    url = uri;
  } catch (error) {
    throw new UploadMetadataError(
      "Metaplex: Failed to upload metadata to Metaplex."
    );
  }
  return url;
};
