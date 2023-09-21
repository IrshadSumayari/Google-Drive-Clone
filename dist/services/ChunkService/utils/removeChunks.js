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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fileUtils_1 = __importDefault(require("../../../db/utils/fileUtils"));
const dbUtilsFile = new fileUtils_1.default();
const removeChunks = (bucketStream) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadID = bucketStream.id;
    try {
        if (!uploadID || uploadID.length === 0) {
            console.log("Invalid uploadID for remove chunks");
            return;
        }
        yield dbUtilsFile.removeChunksByID(uploadID);
    }
    catch (e) {
        console.log("Could not remove chunks for canceled upload", uploadID, e);
    }
});
exports.default = removeChunks;
