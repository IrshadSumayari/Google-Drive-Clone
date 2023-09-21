"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const removeChunksFS = (path) => {
    return new Promise((resolve, reject) => {
        fs_1.default.unlink(path, (err) => {
            if (err) {
                console.log("Could not remove fs file", err);
                resolve();
            }
            resolve();
        });
    });
};
exports.default = removeChunksFS;
module.exports = removeChunksFS;
