"use strict";
//import s3 from "../../../db/s3";
Object.defineProperty(exports, "__esModule", { value: true });
const removeChunksS3 = (s3, parmas) => {
    return new Promise((resolve, reject) => {
        s3.deleteObject(parmas, (err, data) => {
            if (err) {
                console.log("Could not remove S3 file");
                reject("Could Not Remove S3 File");
            }
            resolve();
        });
    });
};
exports.default = removeChunksS3;
module.exports = removeChunksS3;
