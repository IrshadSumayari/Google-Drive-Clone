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
const mongoose_1 = __importDefault(require("../../../db/mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const thumbnail_1 = __importDefault(require("../../../models/thumbnail"));
const mongodb_1 = require("mongodb");
const sharp_1 = __importDefault(require("sharp"));
const concat_stream_1 = __importDefault(require("concat-stream"));
const conn = mongoose_1.default.connection;
const createThumbnail = (file, filename, user) => {
    return new Promise((resolve) => {
        const password = user.getEncryptionKey();
        let CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
        let bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db, {
            chunkSizeBytes: 1024 * 255
        });
        const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(file._id));
        readStream.on("error", (e) => {
            console.log("File service upload thumbnail error", e);
            resolve(file);
        });
        const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, file.metadata.IV);
        decipher.on("error", (e) => {
            console.log("File service upload thumbnail decipher error", e);
            resolve(file);
        });
        try {
            const concatStream = concat_stream_1.default((bufferData) => __awaiter(void 0, void 0, void 0, function* () {
                const thumbnailIV = crypto_1.default.randomBytes(16);
                const thumbnailCipher = crypto_1.default.createCipheriv("aes256", CIPHER_KEY, thumbnailIV);
                bufferData = Buffer.concat([thumbnailIV, thumbnailCipher.update(bufferData), thumbnailCipher.final()]);
                const thumbnailModel = new thumbnail_1.default({ name: filename, owner: user._id, data: bufferData });
                yield thumbnailModel.save();
                const getUpdatedFile = yield conn.db.collection("fs.files")
                    .findOneAndUpdate({ "_id": new mongodb_1.ObjectID(file._id) }, { "$set": { "metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id } });
                let updatedFile = getUpdatedFile.value;
                updatedFile = Object.assign(Object.assign({}, updatedFile), { metadata: Object.assign(Object.assign({}, updatedFile.metadata), { hasThumbnail: true, thumbnailID: thumbnailModel._id }) });
                resolve(updatedFile);
            })).on("error", (e) => {
                console.log("File service upload concat stream error", e);
                resolve(file);
            });
            const imageResize = sharp_1.default().resize(300).on("error", (e) => {
                console.log("resize error", e);
                resolve(file);
            });
            readStream.pipe(decipher).pipe(imageResize).pipe(concatStream);
        }
        catch (e) {
            console.log(e);
            resolve(file);
        }
    });
};
exports.default = createThumbnail;
