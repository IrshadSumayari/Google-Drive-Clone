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
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = __importDefault(require("uuid"));
const env_1 = __importDefault(require("../../../enviroment/env"));
const conn = mongoose_1.default.connection;
const createThumbnailFS = (file, filename, user) => {
    return new Promise((resolve) => {
        const password = user.getEncryptionKey();
        let CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
        const thumbnailFilename = uuid_1.default.v4();
        const readStream = fs_1.default.createReadStream(file.metadata.filePath);
        const writeStream = fs_1.default.createWriteStream(env_1.default.fsDirectory + thumbnailFilename);
        const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, file.metadata.IV);
        readStream.on("error", (e) => {
            console.log("File service upload thumbnail error", e);
            resolve(file);
        });
        writeStream.on("error", (e) => {
            console.log("File service upload write thumbnail error", e);
            resolve(file);
        });
        decipher.on("error", (e) => {
            console.log("File service upload thumbnail decipher error", e);
            resolve(file);
        });
        try {
            const thumbnailIV = crypto_1.default.randomBytes(16);
            const thumbnailCipher = crypto_1.default.createCipheriv("aes256", CIPHER_KEY, thumbnailIV);
            const imageResize = sharp_1.default().resize(300).on("error", (e) => {
                console.log("resize error", e);
                resolve(file);
            });
            readStream.pipe(decipher).pipe(imageResize).pipe(thumbnailCipher).pipe(writeStream);
            writeStream.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
                const thumbnailModel = new thumbnail_1.default({ name: filename, owner: user._id, IV: thumbnailIV, path: env_1.default.fsDirectory + thumbnailFilename });
                yield thumbnailModel.save();
                const getUpdatedFile = yield conn.db.collection("fs.files")
                    .findOneAndUpdate({ "_id": file._id }, { "$set": { "metadata.hasThumbnail": true, "metadata.thumbnailID": thumbnailModel._id } });
                let updatedFile = getUpdatedFile.value;
                updatedFile = Object.assign(Object.assign({}, updatedFile), { metadata: Object.assign(Object.assign({}, updatedFile.metadata), { hasThumbnail: true, thumbnailID: thumbnailModel._id }) });
                resolve(updatedFile);
            }));
        }
        catch (e) {
            console.log("Thumbnail error", e);
            resolve(file);
        }
    });
};
exports.default = createThumbnailFS;
