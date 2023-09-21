"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3Auth = (id, key) => {
    aws_sdk_1.default.config.update({
        accessKeyId: id,
        secretAccessKey: key
    });
    const s3 = new aws_sdk_1.default.S3();
    return s3;
};
exports.default = s3Auth;
