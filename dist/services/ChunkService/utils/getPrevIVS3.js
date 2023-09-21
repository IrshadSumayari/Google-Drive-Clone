"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3_1 = __importDefault(require("../../../db/s3"));
const S3Personal_1 = __importDefault(require("../../../db/S3Personal"));
const env_1 = __importDefault(require("../../../enviroment/env"));
const getPrevIV = (start, key, isPersonal, user) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        if (isPersonal) {
            const s3Data = yield user.decryptS3Data();
            const params = { Bucket: s3Data.bucket, Key: key, Range: `bytes=${start}-${start + 15}` };
            const s3Storage = S3Personal_1.default(s3Data.id, s3Data.key);
            const stream = s3Storage.getObject(params).createReadStream();
            stream.on("data", (data) => {
                resolve(data);
            });
        }
        else {
            const params = { Bucket: env_1.default.s3Bucket, Key: key, Range: `bytes=${start}-${start + 15}` };
            const stream = s3_1.default.getObject(params).createReadStream();
            stream.on("data", (data) => {
                resolve(data);
            });
        }
    }));
};
exports.default = getPrevIV;
