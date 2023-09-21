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
const convertDriveFoldersToMongoFolders_1 = __importDefault(require("../../utils/convertDriveFoldersToMongoFolders"));
const FolderService_1 = __importDefault(require("../FolderService"));
const sortGoogleMongoFolderList_1 = __importDefault(require("../../utils/sortGoogleMongoFolderList"));
const convertDriveFolderToMongoFolder_1 = __importDefault(require("../../utils/convertDriveFolderToMongoFolder"));
const googleFolderUtils_1 = __importDefault(require("../../db/utils/googleFolderUtils"));
const googleDbFolderUtils = new googleFolderUtils_1.default();
const folderService = new FolderService_1.default();
const fields = 'id, name, createdTime, parents, mimeType';
class GoogleFolderService {
    constructor() {
        this.getList = (user, query) => __awaiter(this, void 0, void 0, function* () {
            const folders = yield googleDbFolderUtils.getList(query, user);
            const userID = user._id;
            const convertedFolders = convertDriveFoldersToMongoFolders_1.default(folders.data.files, userID);
            return convertedFolders;
        });
        this.getGoogleMongoList = (user, query) => __awaiter(this, void 0, void 0, function* () {
            const googleFolderList = yield googleDbFolderUtils.getList(query, user);
            const userID = user._id;
            const convertedFolders = convertDriveFoldersToMongoFolders_1.default(googleFolderList.data.files, userID);
            const folderList = yield folderService.getFolderList(user, query);
            const mongoGoogleList = sortGoogleMongoFolderList_1.default([...convertedFolders, ...folderList], query);
            return mongoGoogleList;
        });
        this.getInfo = (user, id) => __awaiter(this, void 0, void 0, function* () {
            const folder = yield googleDbFolderUtils.getInfo(id, user);
            const userID = user._id;
            const convertedFolder = convertDriveFolderToMongoFolder_1.default(folder.data, userID);
            return convertedFolder;
        });
        this.getSubFolderList = (user, id) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const file = yield drive.files.get({ fileId: id, fields: fields });
            let folderIDList = [];
            let folderNameList = [];
            folderIDList.push("/");
            folderNameList.push("Home");
            const rootGet = yield drive.files.get({ fileId: "root" });
            const rootID = rootGet.data.id;
            let currentID = file.data.parents[0];
            while (true) {
                if (rootID === currentID)
                    break;
                const currentFile = yield drive.files.get({ fileId: currentID, fields: fields });
                folderIDList.splice(1, 0, currentFile.data.id);
                folderNameList.splice(1, 0, currentFile.data.name);
                currentID = currentFile.data.parents[0];
            }
            folderIDList.push(id);
            folderNameList.push(file.data.name);
            return {
                folderIDList,
                folderNameList
            };
        });
        this.getSubFolderFullList = (user, id) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const file = yield drive.files.get({ fileId: id, fields: fields });
            const parent = file.data.parents[0];
            let queryBuilder = `mimeType = "application/vnd.google-apps.folder"`;
            queryBuilder += ` and "${file.data.id}" in parents`;
            const subFolders = yield drive.files.list({ fields: `files(${fields})`, q: queryBuilder });
            const convertedFile = convertDriveFolderToMongoFolder_1.default(file.data, user._id);
            const convertedSubFolders = convertDriveFoldersToMongoFolders_1.default(subFolders.data.files, user._id);
            let folderList = [];
            const rootGet = yield drive.files.get({ fileId: 'root', fields: fields });
            const rootID = rootGet.data.id;
            let currentID = file.data.parents[0];
            folderList.push({
                _id: convertedFile._id,
                parent: convertedFile._id,
                name: convertedFile.name,
                subFolders: convertedSubFolders
            });
            while (true) {
                if (rootID === currentID)
                    break;
                const currentFile = yield drive.files.get({ fileId: currentID, fields: fields });
                const currentConvertedFile = convertDriveFolderToMongoFolder_1.default(currentFile.data, user._id);
                queryBuilder = `mimeType = "application/vnd.google-apps.folder"`;
                queryBuilder += ` and "${currentConvertedFile._id}" in parents`;
                const currentSubFolders = yield drive.files.list({ fields: `files(${fields})`, q: queryBuilder });
                const currentConvertedSubFolders = convertDriveFoldersToMongoFolders_1.default(currentSubFolders.data.files, user._id);
                folderList.splice(0, 0, {
                    _id: currentConvertedFile._id,
                    parent: currentConvertedFile._id,
                    name: currentConvertedFile.name,
                    subFolders: currentConvertedSubFolders
                });
                currentID = currentFile.data.parents[0];
            }
            return folderList;
        });
        this.renameFolder = (user, folderID, title) => __awaiter(this, void 0, void 0, function* () {
            yield googleDbFolderUtils.renameFolder(folderID, title, user);
        });
        this.removeFolder = (user, folderID) => __awaiter(this, void 0, void 0, function* () {
            yield googleDbFolderUtils.removeFolder(folderID, user);
        });
        this.upload = (user, name, parent) => __awaiter(this, void 0, void 0, function* () {
            const createdFolder = yield googleDbFolderUtils.uploadFolder(name, parent, user);
            const userID = user._id;
            const convertedFolder = convertDriveFolderToMongoFolder_1.default(createdFolder.data, userID);
            return convertedFolder;
        });
        this.moveFolder = (user, fileID, parentID) => __awaiter(this, void 0, void 0, function* () {
            yield googleDbFolderUtils.moveFolder(fileID, parentID, user);
        });
    }
}
exports.default = GoogleFolderService;
