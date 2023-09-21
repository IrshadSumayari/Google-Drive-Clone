"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const env_1 = __importDefault(require("../enviroment/env"));
aws_sdk_1.default.config.update({
    accessKeyId: env_1.default.s3ID,
    secretAccessKey: env_1.default.s3Key
});
const s3 = new aws_sdk_1.default.S3();
exports.default = s3;
module.exports = s3;
