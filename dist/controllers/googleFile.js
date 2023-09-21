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
const GoogleFileService_1 = __importDefault(require("../services/GoogleFileService"));
const googleFileService = new GoogleFileService_1.default();
class GoogleFileController {
    constructor() {
        this.getList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const query = req.query;
                const googleFiles = yield googleFileService.getList(user, query);
                res.send(googleFiles);
            }
            catch (e) {
                console.log("\nGet Google List Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getMongoGoogleList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const query = req.query;
                const mongoGoogleFiles = yield googleFileService.getMongoGoogleList(user, query);
                res.send(mongoGoogleFiles);
            }
            catch (e) {
                console.log("\nGet Google/Mongo List Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getFileInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const id = req.params.id;
                const user = req.user;
                const fileInfo = yield googleFileService.getFileInfo(user, id);
                res.send(fileInfo);
            }
            catch (e) {
                console.log("\nGet Info Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getGoogleMongoQuickList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const googleMongoQuickList = yield googleFileService.getGoogleMongoQuickList(user);
                res.send(googleMongoQuickList);
            }
            catch (e) {
                console.log("\nGet Google/Mongo Quicklist Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getGoogleMongoSuggestedList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const searchQuery = req.query.search || "";
                const fileAndFolderList = yield googleFileService.getGoogleMongoSuggestedList(user, searchQuery);
                res.send(fileAndFolderList);
            }
            catch (e) {
                console.log("\nGet Google/Mongo Suggested List Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.renameFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.body.id;
                const title = req.body.title;
                yield googleFileService.renameFile(user, fileID, title);
                res.send();
            }
            catch (e) {
                console.log("\nRename File Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.removeFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const fileID = req.body.id;
                const user = req.user;
                yield googleFileService.removeFile(user, fileID);
                res.send();
            }
            catch (e) {
                console.log("\nRemove File Error Error Google File Route:", e.message);
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
                yield googleFileService.downloadFile(user, fileID, res);
            }
            catch (e) {
                console.log("\nDownload File Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.downloadDoc = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                yield googleFileService.downloadDoc(user, fileID, res);
            }
            catch (e) {
                console.log("\nDownload Doc Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getThumbnail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                yield googleFileService.getThumbnail(user, fileID, res);
            }
            catch (e) {
                console.log("\nGet Thumbnail Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getFulllThumbnail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                yield googleFileService.getFullThumbnail(user, fileID, res);
            }
            catch (e) {
                console.log("\nGet Full Thumbnail Error Google File Route:", e.message);
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
                const tempUUID = req.params.uuid;
                yield googleFileService.streamVideo(user, fileID, tempUUID, req, res);
            }
            catch (e) {
                console.log("\nStream Video Error Google File Route:", e.message);
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
                yield googleFileService.uploadFile(user, busboy, req, res);
            }
            catch (e) {
                console.log("\nUpload File Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.moveFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.body.id;
                const parentID = req.body.parent;
                yield googleFileService.moveFile(user, fileID, parentID);
                res.send();
            }
            catch (e) {
                console.log("\nMove File Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.makeFilePublic = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                const publicURL = yield googleFileService.makeFilePublic(user, fileID);
                res.send(publicURL);
            }
            catch (e) {
                console.log("\nMake Public Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.removePublicLink = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const fileID = req.params.id;
                yield googleFileService.removePublicLink(user, fileID);
                res.send();
            }
            catch (e) {
                console.log("\nRemove Public Error Google File Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
    }
}
exports.default = GoogleFileController;
