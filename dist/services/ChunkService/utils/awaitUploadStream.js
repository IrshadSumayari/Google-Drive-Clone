"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const removeChunks_1 = __importDefault(require("./removeChunks"));
const awaitUploadStream = (inputSteam, outputStream, req, allStreamsToErrorCatch) => {
    return new Promise((resolve, reject) => {
        allStreamsToErrorCatch.forEach((currentStream) => {
            currentStream.on("error", (e) => {
                removeChunks_1.default(outputStream);
                reject({
                    message: "Await Stream Input Error",
                    code: 500,
                    error: e
                });
            });
        });
        req.on("aborted", () => {
            removeChunks_1.default(outputStream);
        });
        inputSteam.pipe(outputStream).on("finish", (data) => {
            resolve(data);
        });
    });
};
exports.default = awaitUploadStream;
