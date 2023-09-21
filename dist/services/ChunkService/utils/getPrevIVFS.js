"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const getPrevIV = (start, path) => {
    return new Promise((resolve, reject) => {
        const stream = fs_1.default.createReadStream(path, {
            start,
            end: start + 15
        });
        stream.on("data", (data) => {
            resolve(data);
        });
    });
};
exports.default = getPrevIV;
