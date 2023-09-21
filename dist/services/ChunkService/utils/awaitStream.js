"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awaitStream = (inputSteam, outputStream, allStreamsToErrorCatch) => {
    return new Promise((resolve, reject) => {
        allStreamsToErrorCatch.forEach((currentStream) => {
            currentStream.on("error", (e) => {
                reject({
                    message: "Await Stream Input Error",
                    code: 500,
                    error: e
                });
            });
        });
        inputSteam.pipe(outputStream).on("finish", (data) => {
            resolve(data);
        });
    });
};
exports.default = awaitStream;
