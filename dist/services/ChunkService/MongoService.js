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
const mongoose_1 = __importDefault(require("../../db/mongoose"));
;
const fileUtils_1 = __importDefault(require("../../db/utils/fileUtils"));
const crypto_1 = __importDefault(require("crypto"));
const videoChecker_1 = __importDefault(require("../../utils/videoChecker"));
const imageChecker_1 = __importDefault(require("../../utils/imageChecker"));
const mongodb_1 = require("mongodb");
const createThumbailAny_1 = __importDefault(require("./utils/createThumbailAny"));
const thumbnail_1 = __importDefault(require("../../models/thumbnail"));
const NotAuthorizedError_1 = __importDefault(require("../../utils/NotAuthorizedError"));
const NotFoundError_1 = __importDefault(require("../../utils/NotFoundError"));
const awaitStream_1 = __importDefault(require("./utils/awaitStream"));
const awaitUploadStream_1 = __importDefault(require("./utils/awaitUploadStream"));
const user_1 = __importDefault(require("../../models/user"));
const folder_1 = __importDefault(require("../../models/folder"));
const getBusboyData_1 = __importDefault(require("./utils/getBusboyData"));
const fixStartChunkLength_1 = __importDefault(require("./utils/fixStartChunkLength"));
const getPrevIVMongo_1 = __importDefault(require("./utils/getPrevIVMongo"));
const awaitStreamVideo_1 = __importDefault(require("./utils/awaitStreamVideo"));
const addToStorageSize_1 = __importDefault(require("./utils/addToStorageSize"));
const subtractFromStorageSize_1 = __importDefault(require("./utils/subtractFromStorageSize"));
const ForbiddenError_1 = __importDefault(require("../../utils/ForbiddenError"));
const conn = mongoose_1.default.connection;
const dbUtilsFile = new fileUtils_1.default();
class MongoService {
    constructor() {
        this.uploadFile = (user, busboy, req) => __awaiter(this, void 0, void 0, function* () {
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            let bucketStream;
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
            const metadata = {
                owner: user._id,
                parent,
                parentList,
                hasThumbnail,
                thumbnailID,
                isVideo,
                size,
                IV: initVect
            };
            let bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            bucketStream = bucket.openUploadStream(filename, { metadata });
            const allStreamsToErrorCatch = [file, cipher, bucketStream];
            const finishedFile = yield awaitUploadStream_1.default(file.pipe(cipher), bucketStream, req, allStreamsToErrorCatch);
            yield addToStorageSize_1.default(user, size, personalFile);
            const imageCheck = imageChecker_1.default(filename);
            if (finishedFile.length < 15728640 && imageCheck) {
                const updatedFile = yield createThumbailAny_1.default(finishedFile, filename, user);
                return updatedFile;
            }
            else {
                return finishedFile;
            }
        });
        this.getFileWriteStream = (user, file, parentFolder) => __awaiter(this, void 0, void 0, function* () {
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
                IV: file.metadata.IV
            };
            let bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            const bucketStream = bucket.openUploadStream(filename, { metadata });
            return bucketStream;
        });
        this.downloadFile = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const currentFile = yield dbUtilsFile.getFileInfo(fileID, user._id);
            if (!currentFile)
                throw new NotFoundError_1.default("Download File Not Found");
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            const IV = currentFile.metadata.IV.buffer;
            const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID));
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + currentFile.filename + '"');
            res.set('Content-Length', currentFile.metadata.size.toString());
            const allStreamsToErrorCatch = [readStream, decipher];
            yield awaitStream_1.default(readStream.pipe(decipher), res, allStreamsToErrorCatch);
        });
        this.getFileReadStream = (user, fileID) => __awaiter(this, void 0, void 0, function* () {
            const currentFile = yield dbUtilsFile.getFileInfo(fileID, user._id);
            if (!currentFile)
                throw new NotFoundError_1.default("Download File Not Found");
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            const IV = currentFile.metadata.IV.buffer;
            const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID));
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            return readStream;
        });
        this.getThumbnail = (user, id) => __awaiter(this, void 0, void 0, function* () {
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const thumbnail = yield thumbnail_1.default.findById(new mongodb_1.ObjectID(id));
            if (thumbnail.owner !== user._id.toString()) {
                throw new ForbiddenError_1.default('Thumbnail Unauthorized Error');
            }
            const iv = thumbnail.data.slice(0, 16);
            const chunk = thumbnail.data.slice(16);
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv("aes256", CIPHER_KEY, iv);
            const decryptedThumbnail = Buffer.concat([decipher.update(chunk), decipher.final()]);
            return decryptedThumbnail;
        });
        this.getFullThumbnail = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const userID = user._id;
            const file = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!file)
                throw new NotFoundError_1.default("File Thumbnail Not Found");
            const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            const password = user.getEncryptionKey();
            const IV = file.metadata.IV.buffer;
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID));
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
            const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db);
            const IV = file.metadata.IV.buffer;
            const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID));
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
        this.streamVideo = (user, fileID, headers, res, req) => __awaiter(this, void 0, void 0, function* () {
            // THIS ISN'T WORKING FULLY WHEN USING MONGODB AND SAFARI, 
            // OTHER DATABASES SHOULD WORK, BUT I AM NOT SURE WHY
            // IT WILL NOT WORK ON SAFARI SOMETIMES
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
                fixedEnd = 16;
                // I am not sure why this needs to be 16 for mongoDB, on the other routes 15 works
                // Fine, and I thought the start and end were inclusive, but I am really not sure
                // At this point
            }
            else {
                // If you're a normal browser, or this isn't Safari's first request
                // We need to make it so start is divisible by 16, since AES256
                // Has a block size of 16 bytes.
                fixedStart = start % 16 === 0 ? start : fixStartChunkLength_1.default(start);
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
                currentIV = (yield getPrevIVMongo_1.default(fixedStart - 16, fileID));
            }
            const bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db, {});
            const readStream = bucket.openDownloadStream(new mongodb_1.ObjectID(fileID), {
                start: fixedStart,
                end: fixedEnd,
            });
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            res.writeHead(206, head);
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, currentIV);
            decipher.setAutoPadding(false);
            const allStreamsToErrorCatch = [readStream, decipher];
            readStream.pipe(decipher);
            yield awaitStreamVideo_1.default(start, end, differenceStart, decipher, res, req, allStreamsToErrorCatch, readStream);
            readStream.destroy();
        });
        this.deleteFile = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            let bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db, {
                chunkSizeBytes: 1024 * 255,
            });
            const file = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!file)
                throw new NotFoundError_1.default("Delete File Not Found Error");
            if (file.metadata.thumbnailID) {
                yield thumbnail_1.default.deleteOne({ _id: file.metadata.thumbnailID });
            }
            yield bucket.delete(new mongodb_1.ObjectID(fileID));
            yield subtractFromStorageSize_1.default(userID, file.length, file.metadata.personalFile);
        });
        this.deleteFolder = (userID, folderID, parentList) => __awaiter(this, void 0, void 0, function* () {
            let bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db, {
                chunkSizeBytes: 1024 * 255
            });
            const parentListString = parentList.toString();
            yield folder_1.default.deleteMany({ "owner": userID, "parentList": { $all: parentList } });
            yield folder_1.default.deleteMany({ "owner": userID, "_id": folderID });
            const fileList = yield dbUtilsFile.getFileListByParent(userID, parentListString);
            if (!fileList)
                throw new NotFoundError_1.default("Delete File List Not Found");
            for (let i = 0; i < fileList.length; i++) {
                const currentFile = fileList[i];
                try {
                    if (currentFile.metadata.thumbnailID) {
                        yield thumbnail_1.default.deleteOne({ _id: currentFile.metadata.thumbnailID });
                    }
                    yield bucket.delete(new mongodb_1.ObjectID(currentFile._id));
                }
                catch (e) {
                    console.log("Could not delete file", currentFile.filename, currentFile._id);
                }
            }
        });
        this.deleteAll = (userID) => __awaiter(this, void 0, void 0, function* () {
            let bucket = new mongoose_1.default.mongo.GridFSBucket(conn.db, {
                chunkSizeBytes: 1024 * 255
            });
            yield folder_1.default.deleteMany({ "owner": userID });
            const fileList = yield dbUtilsFile.getFileListByOwner(userID);
            if (!fileList)
                throw new NotFoundError_1.default("Delete All File List Not Found Error");
            for (let i = 0; i < fileList.length; i++) {
                const currentFile = fileList[i];
                try {
                    if (currentFile.metadata.thumbnailID) {
                        yield thumbnail_1.default.deleteOne({ _id: currentFile.metadata.thumbnailID });
                    }
                    yield bucket.delete(new mongodb_1.ObjectID(currentFile._id));
                }
                catch (e) {
                    console.log("Could Not Remove File", currentFile.filename, currentFile._id);
                }
            }
        });
    }
}
exports.default = MongoService;
