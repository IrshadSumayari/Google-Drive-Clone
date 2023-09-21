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
const file_1 = __importDefault(require("../../models/file"));
const user_1 = __importDefault(require("../../models/user"));
const s3_1 = __importDefault(require("../../db/s3"));
const env_1 = __importDefault(require("../../enviroment/env"));
const NotAuthorizedError_1 = __importDefault(require("../../utils/NotAuthorizedError"));
const NotFoundError_1 = __importDefault(require("../../utils/NotFoundError"));
const crypto_1 = __importDefault(require("crypto"));
const getBusboyData_1 = __importDefault(require("./utils/getBusboyData"));
const videoChecker_1 = __importDefault(require("../../utils/videoChecker"));
const uuid_1 = __importDefault(require("uuid"));
const awaitUploadStreamS3_1 = __importDefault(require("./utils/awaitUploadStreamS3"));
const awaitStream_1 = __importDefault(require("./utils/awaitStream"));
const createThumbailAny_1 = __importDefault(require("./utils/createThumbailAny"));
const imageChecker_1 = __importDefault(require("../../utils/imageChecker"));
const thumbnail_1 = __importDefault(require("../../models/thumbnail"));
const streamToBuffer_1 = __importDefault(require("../../utils/streamToBuffer"));
const removeChunksS3_1 = __importDefault(require("./utils/removeChunksS3"));
const fixStartChunkLength_1 = __importDefault(require("./utils/fixStartChunkLength"));
const fixEndChunkLength_1 = __importDefault(require("./utils/fixEndChunkLength"));
const getPrevIVS3_1 = __importDefault(require("./utils/getPrevIVS3"));
const awaitStreamVideo_1 = __importDefault(require("./utils/awaitStreamVideo"));
const folder_1 = __importDefault(require("../../models/folder"));
const index_1 = __importDefault(require("../../db/utils/fileUtils/index"));
const S3Personal_1 = __importDefault(require("../../db/S3Personal"));
const addToStorageSize_1 = __importDefault(require("./utils/addToStorageSize"));
const subtractFromStorageSize_1 = __importDefault(require("./utils/subtractFromStorageSize"));
const ForbiddenError_1 = __importDefault(require("../../utils/ForbiddenError"));
const mongodb_1 = require("mongodb");
const dbUtilsFile = new index_1.default();
class S3Service {
    constructor() {
        this.uploadFile = (user, busboy, req) => __awaiter(this, void 0, void 0, function* () {
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const initVect = crypto_1.default.randomBytes(16);
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const cipher = crypto_1.default.createCipheriv('aes256', CIPHER_KEY, initVect);
            const { file, filename, formData } = yield getBusboyData_1.default(busboy);
            const parent = formData.get("parent") || "/";
            const parentList = formData.get("parentList") || "/";
            const size = formData.get("size") || "";
            const personalFile = formData.get("personal-file") ? true : false;
            let hasThumbnail = false;
            let thumbnailID = "";
            const isVideo = videoChecker_1.default(filename);
            const randomS3ID = uuid_1.default.v4();
            const s3Data = personalFile ? yield user.decryptS3Data() : {};
            const bucketName = personalFile ? s3Data.bucket : env_1.default.s3Bucket;
            let metadata = {
                owner: user._id,
                parent,
                parentList,
                hasThumbnail,
                thumbnailID,
                isVideo,
                size,
                IV: initVect,
                s3ID: randomS3ID,
            };
            if (personalFile)
                metadata = Object.assign(Object.assign({}, metadata), { personalFile: true });
            const params = {
                Bucket: bucketName,
                Body: file.pipe(cipher),
                Key: randomS3ID
            };
            yield awaitUploadStreamS3_1.default(params, personalFile, s3Data);
            const date = new Date();
            const encryptedFileSize = size;
            const currentFile = new file_1.default({
                filename,
                uploadDate: date.toISOString(),
                length: encryptedFileSize,
                metadata
            });
            yield currentFile.save();
            yield addToStorageSize_1.default(user, size, personalFile);
            const imageCheck = imageChecker_1.default(currentFile.filename);
            if (currentFile.length < 15728640 && imageCheck) {
                const updatedFile = yield createThumbailAny_1.default(currentFile, filename, user);
                return updatedFile;
            }
            else {
                return currentFile;
            }
        });
        this.getFileWriteStream = (user, file, parentFolder, readStream) => __awaiter(this, void 0, void 0, function* () {
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const initVect = crypto_1.default.randomBytes(16);
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const cipher = crypto_1.default.createCipheriv('aes256', CIPHER_KEY, initVect);
            const filename = file.filename;
            const parent = parentFolder._id;
            const parentList = [...parentFolder.parentList, parentFolder._id];
            const size = file.metadata.size;
            const personalFile = file.metadata.personalFile ? true : false;
            let hasThumbnail = file.metadata.hasThumbnail;
            let thumbnailID = file.metadata.thumbnailID;
            const isVideo = file.metadata.isVideo;
            const metadata = {
                owner: user._id,
                parent,
                parentList,
                hasThumbnail,
                thumbnailID,
                isVideo,
                size,
                IV: file.metadata.IV,
                s3ID: file.metadata.s3ID,
                personalFile
            };
            const s3Data = personalFile ? yield user.decryptS3Data() : {};
            const bucketName = personalFile ? s3Data.bucket : env_1.default.s3Bucket;
            const params = {
                Bucket: bucketName,
                Body: readStream,
                Key: file.metadata.s3ID
            };
        });
        this.getS3AuthThumbnail = (thumbnail, user) => __awaiter(this, void 0, void 0, function* () {
            if (thumbnail.personalFile) {
                const s3Data = yield user.decryptS3Data();
                //console.log("s3 data", s3Data)
                return { s3Storage: S3Personal_1.default(s3Data.id, s3Data.key), bucket: s3Data.bucket };
            }
            else {
                return { s3Storage: s3_1.default, bucket: env_1.default.s3Bucket };
            }
        });
        this.getS3Auth = (file, user) => __awaiter(this, void 0, void 0, function* () {
            if (file.metadata.personalFile) {
                const s3Data = yield user.decryptS3Data();
                //console.log("s3 data", s3Data)
                return { s3Storage: S3Personal_1.default(s3Data.id, s3Data.key), bucket: s3Data.bucket };
            }
            else {
                return { s3Storage: s3_1.default, bucket: env_1.default.s3Bucket };
            }
        });
        this.downloadFile = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const currentFile = yield dbUtilsFile.getFileInfo(fileID, user._id);
            if (!currentFile)
                throw new NotFoundError_1.default("Download File Not Found");
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const { s3Storage, bucket } = yield this.getS3Auth(currentFile, user);
            const IV = currentFile.metadata.IV.buffer;
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
            res.set('Content-Length', currentFile.metadata.size.toString());
            const params = { Bucket: bucket, Key: currentFile.metadata.s3ID };
            const s3ReadStream = s3Storage.getObject(params).createReadStream();
            const allStreamsToErrorCatch = [s3ReadStream, decipher];
            yield awaitStream_1.default(s3ReadStream.pipe(decipher), res, allStreamsToErrorCatch);
        });
        this.getFileReadStream = (user, fileID) => __awaiter(this, void 0, void 0, function* () {
            const currentFile = yield dbUtilsFile.getFileInfo(fileID, user._id);
            if (!currentFile)
                throw new NotFoundError_1.default("Download File Not Found");
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const { s3Storage, bucket } = yield this.getS3Auth(currentFile, user);
            const IV = currentFile.metadata.IV.buffer;
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            const params = { Bucket: bucket, Key: currentFile.metadata.s3ID };
            const s3ReadStream = s3Storage.getObject(params).createReadStream();
            return s3ReadStream;
        });
        this.streamVideo = (user, fileID, headers, res, req) => __awaiter(this, void 0, void 0, function* () {
            // To get this all working correctly with encryption and across
            // All browsers took many days, tears, and some of my sanity. 
            // Shoutout to Tyzoid for helping me with the decryption
            // And and helping me understand how the IVs work.
            // P.S I hate safari >:(
            // Why do yall have to be weird with video streaming
            // 90% of the issues with this are only in Safari
            // Is safari going to be the next internet explorer?
            const userID = user._id;
            const currentFile = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!currentFile)
                throw new NotFoundError_1.default("Video File Not Found");
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const fileSize = currentFile.metadata.size;
            const isPersonal = currentFile.metadata.personalFile;
            const range = headers.range;
            const parts = range.replace(/bytes=/, "").split("-");
            let start = parseInt(parts[0], 10);
            let end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize - 1;
            const chunksize = (end - start) + 1;
            const IV = currentFile.metadata.IV.buffer;
            let head = {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4'
            };
            let currentIV = IV;
            let fixedStart = 0;
            let fixedEnd = currentFile.length;
            if (start === 0 && end === 1) {
                // This is for Safari/iOS, Safari will request the first
                // Byte before actually playing the video. Needs to be 
                // 16 bytes.
                fixedStart = 0;
                fixedEnd = 15;
            }
            else {
                // If you're a normal browser, or this isn't Safari's first request
                // We need to make it so start is divisible by 16, since AES256
                // Has a block size of 16 bytes.
                fixedStart = start % 16 === 0 ? start : fixStartChunkLength_1.default(start);
                // I goofed up and forgot to add the encrypted file size to S3 data, 
                // It just used the normal file size :(
                // So you'll notice only on the S3 route do i need to fix the end length 
                // To, this is because the other 2 routes use the encrypted file size
                // Which is always a multiple of 16. I cannot change this now
                // Since previous versions will still have the issue, but 
                // This is a simple fix luckily. 
                fixedEnd = fixedEnd % 16 === 0 ? fixedEnd : fixEndChunkLength_1.default(fixedEnd);
            }
            if (+start === 0) {
                // This math will not work if the start is 0
                // So if it is we just change fixed start back
                // To 0.
                fixedStart = 0;
            }
            // We also need to calculate the difference between the start and the 
            // Fixed start position. Since there will be an offset if the original
            // Request is not divisible by 16, it will not return the right part
            // Of the file, you will see how we do this in the awaitStreamVideo
            // code.
            const differenceStart = start - fixedStart;
            if (fixedStart !== 0 && start !== 0) {
                // If this isn't the first request, the way AES256 works is when you try to
                // Decrypt a certain part of the file that isn't the start, the IV will 
                // Actually be the 16 bytes ahead of where you are trying to 
                // Start the decryption.
                currentIV = (yield getPrevIVS3_1.default(fixedStart - 16, currentFile.metadata.s3ID, isPersonal, user));
            }
            const { s3Storage, bucket } = yield this.getS3Auth(currentFile, user);
            const params = { Bucket: bucket, Key: currentFile.metadata.s3ID, Range: `bytes=${fixedStart}-${fixedEnd}` };
            const s3ReadStream = s3Storage.getObject(params).createReadStream();
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, currentIV);
            decipher.setAutoPadding(false);
            res.writeHead(206, head);
            const allStreamsToErrorCatch = [s3ReadStream, decipher];
            s3ReadStream.pipe(decipher);
            yield awaitStreamVideo_1.default(start, end, differenceStart, decipher, res, req, allStreamsToErrorCatch, s3ReadStream);
            s3ReadStream.destroy();
        });
        this.getThumbnail = (user, id) => __awaiter(this, void 0, void 0, function* () {
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const thumbnail = yield thumbnail_1.default.findById(new mongodb_1.ObjectID(id));
            if (thumbnail.owner !== user._id.toString()) {
                throw new ForbiddenError_1.default('Thumbnail Unauthorized Error');
            }
            const iv = thumbnail.IV;
            const { s3Storage, bucket } = yield this.getS3AuthThumbnail(thumbnail, user);
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv("aes256", CIPHER_KEY, iv);
            const params = { Bucket: bucket, Key: thumbnail.s3ID };
            const readStream = s3Storage.getObject(params).createReadStream();
            const allStreamsToErrorCatch = [readStream, decipher];
            const bufferData = yield streamToBuffer_1.default(readStream.pipe(decipher), allStreamsToErrorCatch);
            return bufferData;
        });
        this.getFullThumbnail = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const userID = user._id;
            const file = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!file)
                throw new NotFoundError_1.default("File Thumbnail Not Found");
            const password = user.getEncryptionKey();
            const IV = file.metadata.IV.buffer;
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const { s3Storage, bucket } = yield this.getS3Auth(file, user);
            const params = { Bucket: bucket, Key: file.metadata.s3ID };
            const readStream = s3Storage.getObject(params).createReadStream();
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
            res.set('Content-Length', file.metadata.size.toString());
            const allStreamsToErrorCatch = [readStream, decipher];
            yield awaitStream_1.default(readStream.pipe(decipher), res, allStreamsToErrorCatch);
        });
        this.getPublicDownload = (fileID, tempToken, res) => __awaiter(this, void 0, void 0, function* () {
            const file = yield dbUtilsFile.getPublicFile(fileID);
            if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
                throw new NotAuthorizedError_1.default("File Not Public");
            }
            const user = yield user_1.default.findById(file.metadata.owner);
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const IV = file.metadata.IV.buffer;
            const { s3Storage, bucket } = yield this.getS3Auth(file, user);
            const params = { Bucket: bucket, Key: file.metadata.s3ID };
            const readStream = s3Storage.getObject(params).createReadStream();
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
            res.set('Content-Length', file.metadata.size.toString());
            const allStreamsToErrorCatch = [readStream, decipher];
            yield awaitStream_1.default(readStream.pipe(decipher), res, allStreamsToErrorCatch);
            if (file.metadata.linkType === "one") {
                yield dbUtilsFile.removeOneTimePublicLink(fileID);
            }
        });
        this.deleteFile = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            const file = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!file)
                throw new NotFoundError_1.default("Delete File Not Found Error");
            const user = yield user_1.default.findById(userID);
            const { s3Storage, bucket } = yield this.getS3Auth(file, user);
            if (file.metadata.thumbnailID) {
                const thumbnail = yield thumbnail_1.default.findById(file.metadata.thumbnailID);
                const paramsThumbnail = { Bucket: bucket, Key: thumbnail.s3ID };
                yield removeChunksS3_1.default(s3Storage, paramsThumbnail);
                yield thumbnail_1.default.deleteOne({ _id: file.metadata.thumbnailID });
            }
            const params = { Bucket: bucket, Key: file.metadata.s3ID };
            yield removeChunksS3_1.default(s3Storage, params);
            yield file_1.default.deleteOne({ _id: file._id });
            yield subtractFromStorageSize_1.default(userID, file.length, file.metadata.personalFile);
        });
        this.deleteFolder = (userID, folderID, parentList) => __awaiter(this, void 0, void 0, function* () {
            const parentListString = parentList.toString();
            yield folder_1.default.deleteMany({ "owner": userID, "parentList": { $all: parentList } });
            yield folder_1.default.deleteMany({ "owner": userID, "_id": folderID });
            const fileList = yield dbUtilsFile.getFileListByParent(userID, parentListString);
            if (!fileList)
                throw new NotFoundError_1.default("Delete File List Not Found");
            const user = yield user_1.default.findById(userID);
            for (let i = 0; i < fileList.length; i++) {
                const currentFile = fileList[i];
                const { s3Storage, bucket } = yield this.getS3Auth(currentFile, user);
                try {
                    if (currentFile.metadata.thumbnailID) {
                        const thumbnail = yield thumbnail_1.default.findById(currentFile.metadata.thumbnailID);
                        const paramsThumbnail = { Bucket: bucket, Key: thumbnail.s3ID };
                        yield removeChunksS3_1.default(s3Storage, paramsThumbnail);
                        yield thumbnail_1.default.deleteOne({ _id: currentFile.metadata.thumbnailID });
                    }
                    const params = { Bucket: bucket, Key: currentFile.metadata.s3ID };
                    yield removeChunksS3_1.default(s3Storage, params);
                    yield file_1.default.deleteOne({ _id: currentFile._id });
                }
                catch (e) {
                    console.log("Could not delete file", currentFile.filename, currentFile._id);
                }
            }
        });
        this.deleteAll = (userID) => __awaiter(this, void 0, void 0, function* () {
            yield folder_1.default.deleteMany({ "owner": userID });
            const fileList = yield dbUtilsFile.getFileListByOwner(userID);
            if (!fileList)
                throw new NotFoundError_1.default("Delete All File List Not Found Error");
            const user = yield user_1.default.findById(userID);
            for (let i = 0; i < fileList.length; i++) {
                const currentFile = fileList[i];
                const { s3Storage, bucket } = yield this.getS3Auth(currentFile, user);
                try {
                    if (currentFile.metadata.thumbnailID) {
                        const thumbnail = yield thumbnail_1.default.findById(currentFile.metadata.thumbnailID);
                        const paramsThumbnail = { Bucket: bucket, Key: thumbnail.s3ID };
                        yield removeChunksS3_1.default(s3Storage, paramsThumbnail);
                        yield thumbnail_1.default.deleteOne({ _id: currentFile.metadata.thumbnailID });
                    }
                    const params = { Bucket: bucket, Key: currentFile.metadata.s3ID };
                    yield removeChunksS3_1.default(s3Storage, params);
                    yield file_1.default.deleteOne({ _id: currentFile._id });
                }
                catch (e) {
                    console.log("Could Not Remove File", currentFile.filename, currentFile._id);
                }
            }
        });
    }
}
exports.default = S3Service;
