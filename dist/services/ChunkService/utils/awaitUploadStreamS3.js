"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3_1 = __importDefault(require("../../../db/s3"));
const S3Personal_1 = __importDefault(require("../../../db/S3Personal"));
const awaitUploadStreamS3 = (params, personalFile, s3Data) => {
    return new Promise((resolve, reject) => {
        if (personalFile) {
            const s3PersonalAuth = S3Personal_1.default(s3Data.id, s3Data.key);
            s3PersonalAuth.upload(params, (err, data) => {
                if (err) {
                    console.log("Amazon upload personal err", err);
                    reject("Amazon upload error");
                }
                resolve();
            });
        }
        else {
            s3_1.default.upload(params, (err, data) => {
                if (err) {
                    console.log("Amazon upload err", err);
                    reject("Amazon upload error");
                }
                resolve();
            });
        }
    });
};
exports.default = awaitUploadStreamS3;
