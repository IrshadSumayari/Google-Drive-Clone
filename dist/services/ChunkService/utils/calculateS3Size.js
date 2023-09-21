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
const S3Personal_1 = __importDefault(require("../../../db/S3Personal"));
const calculateS3Size = (id, key, bucket) => __awaiter(void 0, void 0, void 0, function* () {
    const s3Storage = S3Personal_1.default(id, key);
    const params = {
        Bucket: bucket
    };
    const objectList = yield s3Storage.listObjects(params).promise();
    if (!objectList.Contents)
        return 0;
    let size = 0;
    for (let i = 0; i < objectList.Contents.length; i++) {
        const currentObject = objectList.Contents[i];
        if (!currentObject.Size)
            continue;
        size += +currentObject.Size;
    }
    return size;
});
exports.default = calculateS3Size;
