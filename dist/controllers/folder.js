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
const FolderService_1 = __importDefault(require("../services/FolderService"));
const S3Service_1 = __importDefault(require("../services/ChunkService/S3Service"));
const folderService = new FolderService_1.default();
class FolderController {
    constructor(chunkService) {
        this.uploadFolder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const data = req.body;
                const folder = yield folderService.uploadFolder(data);
                res.send(folder);
            }
            catch (e) {
                console.log("\nUpload Folder Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.deleteFolder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.body.id;
                const parentList = req.body.parentList;
                yield this.chunkService.deleteFolder(userID, folderID, parentList);
                res.send();
            }
            catch (e) {
                console.log("\nDelete Folder Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getSubfolderFullList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const id = req.query.id;
                const subfolderList = yield folderService.getSubfolderFullList(user, id);
                res.send(subfolderList);
            }
            catch (e) {
                console.log("\nGet Subfolder List Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.deletePersonalFolder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.body.id;
                const parentList = req.body.parentList;
                const s3Service = new S3Service_1.default();
                yield s3Service.deleteFolder(userID, folderID, parentList);
                res.send();
            }
            catch (e) {
                console.log("\nDelete Personal Folder Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.deleteAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                yield this.chunkService.deleteAll(userID);
                res.send();
            }
            catch (e) {
                console.log("\nDelete All Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.params.id;
                const folder = yield folderService.getFolderInfo(userID, folderID);
                res.send(folder);
            }
            catch (e) {
                console.log("\nGet Info Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getSubfolderList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.query.id;
                const { folderIDList, folderNameList } = yield folderService.getFolderSublist(userID, folderID);
                res.send({ folderIDList, folderNameList });
            }
            catch (e) {
                console.log("\nGet Subfolder Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getFolderList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const query = req.query;
                const folderList = yield folderService.getFolderList(user, query);
                res.send(folderList);
            }
            catch (e) {
                console.log("\nGet Folder List Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.moveFolder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.body.id;
                const parent = req.body.parent;
                yield folderService.moveFolder(userID, folderID, parent);
                res.send();
            }
            catch (e) {
                console.log("\nMove Folder Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.renameFolder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const userID = req.user._id;
                const folderID = req.body.id;
                const title = req.body.title;
                yield folderService.renameFolder(userID, folderID, title);
                res.send();
            }
            catch (e) {
                console.log("\nRename Folder Error Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.chunkService = chunkService;
    }
}
exports.default = FolderController;
