"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const removeChunksFS_1 = __importDefault(require("./removeChunksFS"));
const awaitUploadStream = (inputSteam, outputStream, req, path, allStreamsToCatchError) => {
    return new Promise((resolve, reject) => {
        allStreamsToCatchError.forEach((currentStream) => {
            currentStream.on("error", (e) => {
                removeChunksFS_1.default(path);
                reject({
                    message: "Await Stream Input Error",
                    code: 500,
                    error: e
                });
            });
        });
        req.on("aborted", () => {
            removeChunksFS_1.default(path);
        });
        inputSteam.pipe(outputStream).on("finish", (data) => {
            resolve(data);
        });
    });
};
exports.default = awaitUploadStream;
