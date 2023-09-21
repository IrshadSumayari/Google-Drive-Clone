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
const GoogleFolderService_1 = __importDefault(require("../services/GoogleFolderService"));
const googleFolderService = new GoogleFolderService_1.default();
class GoogleFolderController {
    constructor() {
        this.getList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const query = req.query;
                const folderList = yield googleFolderService.getList(user, query);
                res.send(folderList);
            }
            catch (e) {
                console.log("\nGet Google List Error Google Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getGoogleMongoList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const query = req.query;
                const folderList = yield googleFolderService.getGoogleMongoList(user, query);
                res.send(folderList);
            }
            catch (e) {
                console.log("\nGet Google/Mongo List Error Google Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const id = req.params.id;
                const folderInfo = yield googleFolderService.getInfo(user, id);
                res.send(folderInfo);
            }
            catch (e) {
                console.log("\nGet Info Error Google Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.getSubFolderList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const id = req.query.id;
                const nameAndIDList = yield googleFolderService.getSubFolderList(user, id);
                res.send(nameAndIDList);
            }
            catch (e) {
                console.log("\nGet Subfolder List Error Google Folder Route:", e.message);
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
                const fullSubfolderList = yield googleFolderService.getSubFolderFullList(user, id);
                res.send(fullSubfolderList);
            }
            catch (e) {
                console.log("\nGet Full Subfolder List Error Google Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.renameFolder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const folderID = req.body.id;
                const title = req.body.title;
                yield googleFolderService.renameFolder(user, folderID, title);
                res.send();
            }
            catch (e) {
                console.log("\nRename Folder Error Google Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.removeFolder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const folderID = req.body.id;
                yield googleFolderService.removeFolder(user, folderID);
                res.send();
            }
            catch (e) {
                console.log("\nRemove Folder Error Google Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.upload = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                let { name, parent } = req.body;
                const createdFolder = yield googleFolderService.upload(user, name, parent);
                res.send(createdFolder);
            }
            catch (e) {
                console.log("\nUpload Folder Error Google Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
        this.moveFolder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                return;
            }
            try {
                const user = req.user;
                const folderID = req.body.id;
                const parentID = req.body.parent;
                yield googleFolderService.moveFolder(user, folderID, parentID);
                res.send();
            }
            catch (e) {
                console.log("\nMove Folder Error Google Folder Route:", e.message);
                const code = !e.code ? 500 : e.code >= 400 && e.code <= 599 ? e.code : 500;
                res.status(code).send();
            }
        });
    }
}
exports.default = GoogleFolderController;
