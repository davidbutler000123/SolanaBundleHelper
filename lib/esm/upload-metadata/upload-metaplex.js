var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { toMetaplexFile } from "@metaplex-foundation/js";
import { checkFileExists } from "./utility";
import { UploadMetadataError } from "../errors";
import { readFileSync } from "fs";
export const uploadImageToMetaplex = (metaplex, image) => __awaiter(void 0, void 0, void 0, function* () {
    let url = "";
    if ((yield checkFileExists(image)) === false) {
        throw new UploadMetadataError("Upload file is not exist. Please check.");
    }
    try {
        const fileData = readFileSync(image);
        const metaplexFile = toMetaplexFile(fileData, "meme-logo.png");
        url = yield metaplex.storage().upload(metaplexFile);
    }
    catch (error) {
        throw new UploadMetadataError("Failed to upload image to metaplex.");
    }
    return url;
});
/*
@metaplex: Metaplex which handle uploading
@metadata: upload metadata
*/
export const uploadMetaByMetaplex = (metaplex, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    let url = "";
    try {
        const { uri } = yield metaplex.nfts().uploadMetadata(metadata);
        url = uri;
    }
    catch (error) {
        throw new UploadMetadataError("Metaplex: Failed to upload metadata to Metaplex.");
    }
    return url;
});
