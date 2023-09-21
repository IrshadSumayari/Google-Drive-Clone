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
const FileService_1 = __importDefault(require("../services/FileService"));
const user_1 = __importDefault(require("../models/user"));
const sendShareEmail_1 = __importDefault(require("../utils/sendShareEmail"));
const createCookies_1 = require("../cookies/createCookies");
const fileService = new FileService_1.default();
class FileController {
    constructor(chunkService) {
        this.getThumbnail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const id = req.params.id;
                const decryptedThumbnail = yield this.chunkService.getThumbnail(user, id);
                res.send(decryptedThumbnail);
            }
            catch (e) {
                console.log("\nGet Thumbnail Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getFullThumbnail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                yield this.chunkService.getFullThumbnail(user, fileID, res);
            }
            catch (e) {
                console.log("\nGet Thumbnail Full Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.uploadFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const busboy = req.busboy;
                req.pipe(busboy);
                const file = yield this.chunkService.uploadFile(user, busboy, req);
                res.send(file);
            }
            catch (e) {
                console.log("\nUploading File Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.writeHead(code, { 'Connection': 'close' });
                res.end();
            }
        });
        this.getPublicDownload = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ID = req.params.id;
                const tempToken = req.params.tempToken;
                yield this.chunkService.getPublicDownload(ID, tempToken, res);
            }
            catch (e) {
                console.log("\nGet Public Download Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.removeLink = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const id = req.params.id;
                const userID = req.user._id;
                yield fileService.removeLink(userID, id);
                res.send();
            }
            catch (e) {
                console.log("\nRemove Public Link Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.makePublic = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const fileID = req.params.id;
                const userID = req.user._id;
                const token = yield fileService.makePublic(userID, fileID);
                res.send(token);
            }
            catch (e) {
                console.log("\nMake Public Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getPublicInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const tempToken = req.params.tempToken;
                const file = yield fileService.getPublicInfo(id, tempToken);
                res.send(file);
            }
            catch (e) {
                console.log("\nGet Public Info Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.makeOneTimePublic = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const id = req.params.id;
                const userID = req.user._id;
                const token = yield fileService.makeOneTimePublic(userID, id);
                res.send(token);
            }
            catch (e) {
                console.log("\nMake One Time Public Link Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getFileInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const fileID = req.params.id;
                const userID = req.user._id;
                const file = yield fileService.getFileInfo(userID, fileID);
                res.send(file);
            }
            catch (e) {
                console.log("\nGet File Info Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getQuickList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const quickList = yield fileService.getQuickList(user);
                res.send(quickList);
            }
            catch (e) {
                console.log("\nGet Quick List Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const query = req.query;
                const fileList = yield fileService.getList(user, query);
                res.send(fileList);
            }
            catch (e) {
                console.log("\nGet File List Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getDownloadToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const tempToken = yield fileService.getDownloadToken(user);
                res.send({ tempToken });
            }
            catch (e) {
                console.log("\nGet Download Token Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getAccessTokenStreamVideo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                return;
            try {
                const user = req.user;
                const currentUUID = req.headers.uuid;
                const streamVideoAccessToken = yield user.generateAuthTokenStreamVideo(currentUUID);
                createCookies_1.createStreamVideoCookie(res, streamVideoAccessToken);
                res.send();
            }
            catch (e) {
                console.log("\nGet Access Token Stream Video Fle Route Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.removeStreamVideoAccessToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user)
                return;
            try {
                const userID = req.user._id;
                const accessTokenStreamVideo = req.accessTokenStreamVideo;
                yield user_1.default.updateOne({ _id: userID }, { $pull: { tempTokens: { token: accessTokenStreamVideo } } });
                createCookies_1.removeStreamVideoCookie(res);
                res.send();
            }
            catch (e) {
                console.log("\Remove Video Token File Router Error:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        // No longer needed, left for reference
        // getDownloadTokenVideo = async(req: RequestTypeFullUser, res: Response) => {
        //     if (!req.user) {
        //         return 
        //     }
        //     try {
        //         const user = req.user;
        //         const cookie = req.headers.uuid as string;
        //         const tempToken = await fileService.getDownloadTokenVideo(user, cookie);
        //         res.send({tempToken});
        //     } catch (e) {
        //         const code = e.code || 500;
        //         console.log(e);
        //         res.status(code).send()
        //     }
        // }
        this.removeTempToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const tempToken = req.params.tempToken;
                const currentUUID = req.params.uuid;
                yield fileService.removeTempToken(user, tempToken, currentUUID);
                res.send();
            }
            catch (e) {
                console.log("\nRemove Temp Token Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.streamVideo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                const headers = req.headers;
                yield this.chunkService.streamVideo(user, fileID, headers, res, req);
            }
            catch (e) {
                console.log("\nStream Video Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.downloadFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                yield this.chunkService.downloadFile(user, fileID, res);
            }
            catch (e) {
                console.log("\nDownload File Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getSuggestedList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                let searchQuery = req.query.search || "";
                const { fileList, folderList } = yield fileService.getSuggestedList(userID, searchQuery);
                return res.send({ folderList, fileList });
            }
            catch (e) {
                console.log("\nGet Suggested List Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.renameFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const fileID = req.body.id;
                const title = req.body.title;
                const userID = req.user._id;
                yield fileService.renameFile(userID, fileID, title);
                res.send();
            }
            catch (e) {
                console.log("\nRename File Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.sendEmailShare = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.body.file._id;
                const respient = req.body.file.resp;
                const file = yield fileService.getFileInfo(user._id, fileID);
                yield sendShareEmail_1.default(file, respient);
                res.send();
            }
            catch (e) {
                console.log("\nSend Share Email Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.moveFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const fileID = req.body.id;
                const userID = req.user._id;
                const parentID = req.body.parent;
                yield fileService.moveFile(userID, fileID, parentID);
                res.send();
            }
            catch (e) {
                console.log("\nMove File Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.deleteFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const fileID = req.body.id;
                yield this.chunkService.deleteFile(userID, fileID);
                res.send();
            }
            catch (e) {
                console.log("\nDelete File Error File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.chunkService = chunkService;
    }
}
exports.default = FileController;
