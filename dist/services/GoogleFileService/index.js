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
const googleAuth_1 = __importDefault(require("../../db/googleAuth"));
const googleapis_1 = require("googleapis");
const convertDriveListToMongoList_1 = __importDefault(require("../../utils/convertDriveListToMongoList"));
const FileService_1 = __importDefault(require("../FileService"));
const sortGoogleMongoList_1 = __importDefault(require("../../utils/sortGoogleMongoList"));
const convertDriveToMongo_1 = __importDefault(require("../../utils/convertDriveToMongo"));
const convertDriveFoldersToMongoFolders_1 = __importDefault(require("../../utils/convertDriveFoldersToMongoFolders"));
const tempStorage_1 = __importDefault(require("../../tempStorage/tempStorage"));
const uuid_1 = __importDefault(require("uuid"));
const getBusboyData_1 = __importDefault(require("../ChunkService/utils/getBusboyData"));
const axios_1 = __importDefault(require("axios"));
const awaitUploadGoogle_1 = __importDefault(require("../ChunkService/utils/awaitUploadGoogle"));
const googleFileUtils_1 = __importDefault(require("../../db/utils/googleFileUtils"));
const sortGoogleMongoQuickFiles_1 = __importDefault(require("../../utils/sortGoogleMongoQuickFiles"));
const googleDbFileUtils = new googleFileUtils_1.default();
const fileService = new FileService_1.default();
const fields = 'id, name, size, modifiedTime, hasThumbnail, parents, mimeType, thumbnailLink, webViewLink, shared';
class GoogleFileService {
    constructor() {
        this.getList = (user, query) => __awaiter(this, void 0, void 0, function* () {
            const files = yield googleDbFileUtils.getList(query, user);
            const nextPageToken = files.data.nextPageToken;
            const userID = user._id;
            const convertedFiles = convertDriveListToMongoList_1.default(files.data.files, userID, nextPageToken);
            return convertedFiles;
        });
        this.getMongoGoogleList = (user, query) => __awaiter(this, void 0, void 0, function* () {
            const files = yield googleDbFileUtils.getList(query, user);
            const nextPageToken = files.data.nextPageToken;
            const userID = user._id;
            const convertedFiles = convertDriveListToMongoList_1.default(files.data.files, userID, nextPageToken);
            const fileList = yield fileService.getList(user, query);
            const sortedList = sortGoogleMongoList_1.default([...convertedFiles, ...fileList], query);
            return sortedList;
        });
        this.getFileInfo = (user, id) => __awaiter(this, void 0, void 0, function* () {
            const file = yield googleDbFileUtils.getFileInfo(id, user);
            const userID = user._id;
            const convertedFile = convertDriveToMongo_1.default(file.data, userID);
            return convertedFile;
        });
        this.getGoogleMongoQuickList = (user) => __awaiter(this, void 0, void 0, function* () {
            const files = yield googleDbFileUtils.getQuickList(user);
            const userID = user._id;
            const convertedFiles = convertDriveListToMongoList_1.default(files.data.files, userID);
            const quickList = yield fileService.getQuickList(user);
            const sortedGoogleMongoQuickList = sortGoogleMongoQuickFiles_1.default(convertedFiles, quickList);
            return sortedGoogleMongoQuickList;
        });
        this.getGoogleMongoSuggestedList = (user, searchQuery) => __awaiter(this, void 0, void 0, function* () {
            const { files, folders } = yield googleDbFileUtils.getSuggestedList(searchQuery, user);
            const userID = user._id;
            const convertedFiles = convertDriveListToMongoList_1.default(files.data.files, userID);
            const convertedFolders = convertDriveFoldersToMongoFolders_1.default(folders.data.files, userID);
            const { fileList: mongoFileList, folderList: mongoFolderList } = yield fileService.getSuggestedList(user._id, searchQuery);
            return {
                folderList: [...mongoFolderList, ...convertedFolders],
                fileList: [...mongoFileList, ...convertedFiles]
            };
        });
        this.renameFile = (user, fileID, title) => __awaiter(this, void 0, void 0, function* () {
            yield googleDbFileUtils.renameFile(fileID, title, user);
        });
        this.removeFile = (user, fileID) => __awaiter(this, void 0, void 0, function* () {
            yield googleDbFileUtils.removeFile(fileID, user);
        });
        this.downloadFile = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const { fileMetadata, drive } = yield googleDbFileUtils.getDownloadFileMetadata(fileID, user);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + fileMetadata.data.name + '"');
            res.set('Content-Length', fileMetadata.data.size);
            return new Promise((resolve, reject) => {
                drive.files.get({ fileId: fileID, alt: "media" }, { responseType: "stream" }, (err, resp) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    resp === null || resp === void 0 ? void 0 : resp.data.on("end", () => { resolve(); }).on("error", (err) => {
                        console.log(err);
                        reject();
                    }).pipe(res);
                });
            });
        });
        this.downloadDoc = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const { fileMetadata, drive } = yield googleDbFileUtils.getDownloadFileMetadata(fileID, user);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + fileMetadata.data.name + ".pdf" + '"');
            res.set('Content-Length', fileMetadata.data.size);
            drive.files.export({
                fileId: fileID,
                mimeType: 'application/pdf'
            }, {
                responseType: "stream"
            }, (err, resp) => {
                if (err) {
                    console.log("export err", err);
                    res.end();
                    return;
                }
                resp === null || resp === void 0 ? void 0 : resp.data.pipe(res);
            });
        });
        this.getThumbnail = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const { fileMetadata, drive } = yield googleDbFileUtils.getDownloadFileMetadata(fileID, user);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + fileMetadata.data.name + '"');
            res.set('Content-Length', fileMetadata.data.size);
            return new Promise((resolve, reject) => {
                drive.files.get({ fileId: fileID, alt: "media" }, { responseType: "stream" }, (err, resp) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    resp === null || resp === void 0 ? void 0 : resp.data.on("end", () => { resolve(); }).on("error", (err) => {
                        console.log(err);
                        reject();
                    }).pipe(res);
                });
            });
        });
        this.getFullThumbnail = (user, fileID, res) => __awaiter(this, void 0, void 0, function* () {
            const { fileMetadata, drive } = yield googleDbFileUtils.getDownloadFileMetadata(fileID, user);
            res.set('Content-Type', 'binary/octet-stream');
            res.set('Content-Disposition', 'attachment; filename="' + fileMetadata.data.name + '"');
            res.set('Content-Length', fileMetadata.data.size);
            return new Promise((resolve, reject) => {
                drive.files.get({ fileId: fileID, alt: "media" }, { responseType: "stream" }, (err, resp) => {
                    if (err) {
                        console.log(err);
                        reject();
                        return;
                    }
                    resp === null || resp === void 0 ? void 0 : resp.data.on("end", () => { resolve(); }).on("error", (err) => {
                        console.log(err);
                        reject();
                    }).pipe(res);
                });
            });
        });
        this.streamVideo = (user, fileID, tempUUID, req, res) => __awaiter(this, void 0, void 0, function* () {
            const currentUUID = uuid_1.default.v4();
            tempStorage_1.default[tempUUID] = currentUUID;
            const { fileMetadata, drive } = yield googleDbFileUtils.getDownloadFileMetadata(fileID, user);
            const fileSize = +fileMetadata.data.size;
            const headers = req.headers;
            const range = headers.range;
            const parts = range.replace(/bytes=/, "").split("-");
            let start = parseInt(parts[0], 10);
            let end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize - 1;
            const chunksize = (end - start) + 1;
            let head = {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4'
            };
            res.writeHead(206, head);
            return new Promise((resolve, reject) => {
                drive.files.get({ fileId: fileID, alt: "media" }, { responseType: "stream", headers: {
                        Range: `bytes=${start}-${end}`
                    } }, (err, resp) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    resp === null || resp === void 0 ? void 0 : resp.data.on("end", () => { resolve(); }).on("error", (err) => {
                        console.log(err);
                        reject();
                    }).on("data", () => {
                        if (tempStorage_1.default[tempUUID] !== currentUUID) {
                            resp === null || resp === void 0 ? void 0 : resp.data.destroy();
                            resolve();
                        }
                    }).pipe(res);
                });
            });
        });
        this.uploadFile = (user, busboy, req, res) => __awaiter(this, void 0, void 0, function* () {
            const streamsToErrorCatch = [req, busboy];
            const { file, filename, formData } = yield getBusboyData_1.default(busboy);
            let parent = formData.get("parent") || "/";
            const size = formData.get("size") || "";
            parent = parent === "/" ? "root" : parent;
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            let fileMetadata = {};
            fileMetadata.name = filename;
            if (parent !== "/") {
                fileMetadata.parents = [parent];
            }
            const googleIDandKey = yield user.decryptDriveIDandKey();
            const clientID = googleIDandKey.clientID;
            const clientKey = googleIDandKey.clientKey;
            const googleToken = yield user.decryptDriveTokenData();
            const refreshToken = googleToken.refresh_token;
            const data = {
                client_id: clientID,
                client_secret: clientKey,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            };
            const tokenResp = yield axios_1.default.post("https://www.googleapis.com/oauth2/v4/token", data);
            const accessToken = tokenResp.data.access_token;
            const config = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Length': size,
                'Content-Type': 'application/json'
            };
            const axiosConfigObj = {
                headers: config,
            };
            const axiosBody = {
                name: filename,
                parents: [parent],
                fields: "*"
            };
            yield awaitUploadGoogle_1.default(file, size, axiosBody, axiosConfigObj, drive, req, res, streamsToErrorCatch);
        });
        this.moveFile = (user, fileID, parentID) => __awaiter(this, void 0, void 0, function* () {
            yield googleDbFileUtils.moveFile(fileID, parentID, user);
        });
        this.makeFilePublic = (user, fileID) => __awaiter(this, void 0, void 0, function* () {
            const publicURL = yield googleDbFileUtils.makeFilePublic(fileID, user);
            return publicURL;
        });
        this.removePublicLink = (user, fileID) => __awaiter(this, void 0, void 0, function* () {
            yield googleDbFileUtils.removePublicLink(fileID, user);
        });
    }
}
exports.default = GoogleFileService;
