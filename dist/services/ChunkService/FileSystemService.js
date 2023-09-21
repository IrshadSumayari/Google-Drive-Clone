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
const NotAuthorizedError_1 = __importDefault(require("../../utils/NotAuthorizedError"));
const NotFoundError_1 = __importDefault(require("../../utils/NotFoundError"));
const crypto_1 = __importDefault(require("crypto"));
const getBusboyData_1 = __importDefault(require("./utils/getBusboyData"));
const videoChecker_1 = __importDefault(require("../../utils/videoChecker"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = __importDefault(require("uuid"));
const awaitUploadStreamFS_1 = __importDefault(require("./utils/awaitUploadStreamFS"));
const file_1 = __importDefault(require("../../models/file"));
const getFileSize_1 = __importDefault(require("./utils/getFileSize"));
const index_1 = __importDefault(require("../../db/utils/fileUtils/index"));
const awaitStream_1 = __importDefault(require("./utils/awaitStream"));
const createThumbailAny_1 = __importDefault(require("./utils/createThumbailAny"));
const imageChecker_1 = __importDefault(require("../../utils/imageChecker"));
const thumbnail_1 = __importDefault(require("../../models/thumbnail"));
const streamToBuffer_1 = __importDefault(require("../../utils/streamToBuffer"));
const user_1 = __importDefault(require("../../models/user"));
const env_1 = __importDefault(require("../../enviroment/env"));
const removeChunksFS_1 = __importDefault(require("./utils/removeChunksFS"));
const getPrevIVFS_1 = __importDefault(require("./utils/getPrevIVFS"));
const awaitStreamVideo_1 = __importDefault(require("./utils/awaitStreamVideo"));
const fixStartChunkLength_1 = __importDefault(require("./utils/fixStartChunkLength"));
const folder_1 = __importDefault(require("../../models/folder"));
const addToStorageSize_1 = __importDefault(require("./utils/addToStorageSize"));
const subtractFromStorageSize_1 = __importDefault(require("./utils/subtractFromStorageSize"));
const ForbiddenError_1 = __importDefault(require("../../utils/ForbiddenError"));
const mongodb_1 = require("mongodb");
const dbUtilsFile = new index_1.default();
class FileSystemService {
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
            const systemFileName = uuid_1.default.v4();
            const metadata = {
                owner: user._id,
                parent,
                parentList,
                hasThumbnail,
                thumbnailID,
                isVideo,
                size,
                IV: initVect,
                filePath: env_1.default.fsDirectory + systemFileName
            };
            const fileWriteStream = fs_1.default.createWriteStream(metadata.filePath);
            const totalStreamsToErrorCatch = [file, cipher, fileWriteStream];
            yield awaitUploadStreamFS_1.default(file.pipe(cipher), fileWriteStream, req, metadata.filePath, totalStreamsToErrorCatch);
            const date = new Date();
            const encryptedFileSize = yield getFileSize_1.default(metadata.filePath);
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
            const systemFileName = uuid_1.default.v4();
            const metadata = {
                owner: user._id,
                parent,
                parentList,
                hasThumbnail,
                thumbnailID,
                isVideo,
                size,
                IV: file.metadata.IV,
                filePath: env_1.default.fsDirectory + systemFileName
            };
            const fileWriteStream = fs_1.default.createWriteStream(metadata.filePath);
            return fileWriteStream;
        });
        this.downloadFile = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const currentFile = yield dbUtilsFile.getFileInfo(fileID, user._id);
            if (!currentFile)
                throw new NotFoundError_1.default("Download File Not Found");
            const password = user.getEncryptionKey();
            if (!password)
                throw new ForbiddenError_1.default("Invalid Encryption Key");
            const filePath = currentFile.metadata.filePath;
            const IV = currentFile.metadata.IV.buffer;
            const readStream = fs_1.default.createReadStream(filePath);
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
            const filePath = currentFile.metadata.filePath;
            const IV = currentFile.metadata.IV.buffer;
            const readStream = fs_1.default.createReadStream(filePath);
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
            const iv = thumbnail.IV;
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv("aes256", CIPHER_KEY, iv);
            const readStream = fs_1.default.createReadStream(thumbnail.path);
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
            const readStream = fs_1.default.createReadStream(file.metadata.filePath);
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, IV);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
            res.set('Content-Length', file.metadata.size.toString());
            const allStreamsToErrorCatch = [readStream, decipher];
            yield awaitStream_1.default(readStream.pipe(decipher), res, allStreamsToErrorCatch);
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
            const range = headers.range;
            const parts = range.replace(/bytes=/, "").split("-");
            let start = parseInt(parts[0], 10);
            let end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize - 1;
            const IV = currentFile.metadata.IV.buffer;
            const chunksize = (end - start) + 1;
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
                currentIV = (yield getPrevIVFS_1.default(fixedStart - 16, currentFile.metadata.filePath));
            }
            const readStream = fs_1.default.createReadStream(currentFile.metadata.filePath, {
                start: fixedStart,
                end: fixedEnd,
            });
            const CIPHER_KEY = crypto_1.default.createHash('sha256').update(password).digest();
            const decipher = crypto_1.default.createDecipheriv('aes256', CIPHER_KEY, currentIV);
            decipher.setAutoPadding(false);
            res.writeHead(206, head);
            const allStreamsToErrorCatch = [readStream, decipher];
            readStream.pipe(decipher);
            yield awaitStreamVideo_1.default(start, end, differenceStart, decipher, res, req, allStreamsToErrorCatch, readStream);
            readStream.destroy();
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
            const readStream = fs_1.default.createReadStream(file.metadata.filePath);
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
            if (file.metadata.thumbnailID) {
                const thumbnail = yield thumbnail_1.default.findById(file.metadata.thumbnailID);
                const thumbnailPath = thumbnail.path;
                yield removeChunksFS_1.default(thumbnailPath);
                yield thumbnail_1.default.deleteOne({ _id: file.metadata.thumbnailID });
            }
            yield removeChunksFS_1.default(file.metadata.filePath);
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
            for (let i = 0; i < fileList.length; i++) {
                const currentFile = fileList[i];
                try {
                    if (currentFile.metadata.thumbnailID) {
                        const thumbnail = yield thumbnail_1.default.findById(currentFile.metadata.thumbnailID);
                        const thumbnailPath = thumbnail.path;
                        yield removeChunksFS_1.default(thumbnailPath);
                        yield thumbnail_1.default.deleteOne({ _id: currentFile.metadata.thumbnailID });
                    }
                    yield removeChunksFS_1.default(currentFile.metadata.filePath);
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
            for (let i = 0; i < fileList.length; i++) {
                const currentFile = fileList[i];
                try {
                    if (currentFile.metadata.thumbnailID) {
                        const thumbnail = yield thumbnail_1.default.findById(currentFile.metadata.thumbnailID);
                        const thumbnailPath = thumbnail.path;
                        yield removeChunksFS_1.default(thumbnailPath);
                        yield thumbnail_1.default.deleteOne({ _id: currentFile.metadata.thumbnailID });
                    }
                    yield removeChunksFS_1.default(currentFile.metadata.filePath);
                    yield file_1.default.deleteOne({ _id: currentFile._id });
                }
                catch (e) {
                    console.log("Could Not Remove File", currentFile.filename, currentFile._id);
                }
            }
        });
    }
}
exports.default = FileSystemService;
