"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("../../../db/mongoose"));
const mongodb_1 = require("mongodb");
const conn = mongoose_1.default.connection;
const getPrevIV = (start, fileID) => {
    return new Promise((resolve, reject) => {
        const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
        const stream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID), {
            start: start,
            end: start + 16
        });
        stream.on("data", (data) => {
            resolve(data);
        });
    });
};
exports.default = getPrevIV;
