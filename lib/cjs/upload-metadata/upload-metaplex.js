"use strict";
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
exports.uploadMetaByMetaplex = exports.uploadImageToMetaplex = void 0;
const js_1 = require("@metaplex-foundation/js");
const utility_1 = require("./utility");
const errors_1 = require("../errors");
const fs_1 = require("fs");
const uploadImageToMetaplex = (metaplex, image) => __awaiter(void 0, void 0, void 0, function* () {
    let url = "";
    if ((yield (0, utility_1.checkFileExists)(image)) === false) {
        throw new errors_1.UploadMetadataError("Upload file is not exist. Please check.");
    }
    try {
        const fileData = (0, fs_1.readFileSync)(image);
        const metaplexFile = (0, js_1.toMetaplexFile)(fileData, "meme-logo.png");
        url = yield metaplex.storage().upload(metaplexFile);
    }
    catch (error) {
        throw new errors_1.UploadMetadataError("Failed to upload image to metaplex.");
    }
    return url;
});
exports.uploadImageToMetaplex = uploadImageToMetaplex;
/*
@metaplex: Metaplex which handle uploading
@metadata: upload metadata
*/
const uploadMetaByMetaplex = (metaplex, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    let url = "";
    try {
        const { uri } = yield metaplex.nfts().uploadMetadata(metadata);
        url = uri;
    }
    catch (error) {
        throw new errors_1.UploadMetadataError("Metaplex: Failed to upload metadata to Metaplex.");
    }
    return url;
});
exports.uploadMetaByMetaplex = uploadMetaByMetaplex;
