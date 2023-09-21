"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fixEndChunkLength = (length) => {
    return Math.floor((length - 1) / 16) * 16 + 16;
};
exports.default = fixEndChunkLength;
