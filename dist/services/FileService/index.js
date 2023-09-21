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
const env_1 = __importDefault(require("../../enviroment/env"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const folder_1 = __importDefault(require("../../models/folder"));
const sortBySwitch_1 = __importDefault(require("../../utils/sortBySwitch"));
const createQuery_1 = __importDefault(require("../../utils/createQuery"));
const index_1 = __importDefault(require("../../db/utils/fileUtils/index"));
const folderUtils_1 = __importDefault(require("../../db/utils/folderUtils"));
const tempStorage_1 = __importDefault(require("../../tempStorage/tempStorage"));
const dbUtilsFile = new index_1.default();
const dbUtilsFolder = new folderUtils_1.default();
class MongoFileService {
    constructor() {
        this.removePublicOneTimeLink = (currentFile) => __awaiter(this, void 0, void 0, function* () {
            const fileID = currentFile._id;
            if (currentFile.metadata.linkType === "one") {
                yield dbUtilsFile.removeOneTimePublicLink(fileID);
            }
        });
        this.removeLink = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            const file = yield dbUtilsFile.removeLink(fileID, userID);
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Remove Link File Not Found Error");
        });
        this.makePublic = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            const token = jsonwebtoken_1.default.sign({ _id: userID.toString() }, env_1.default.passwordAccess);
            const file = yield dbUtilsFile.makePublic(fileID, userID, token);
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Make Public File Not Found Error");
            return token;
        });
        this.getPublicInfo = (fileID, tempToken) => __awaiter(this, void 0, void 0, function* () {
            const file = yield dbUtilsFile.getPublicInfo(fileID, tempToken);
            if (!file || !file.metadata.link || file.metadata.link !== tempToken) {
                throw new NotFoundError_1.default("Public Info Not Found");
            }
            else {
                return file;
            }
        });
        this.makeOneTimePublic = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            const token = jsonwebtoken_1.default.sign({ _id: userID.toString() }, env_1.default.passwordAccess);
            const file = yield dbUtilsFile.makeOneTimePublic(fileID, userID, token);
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Make One Time Public Not Found Error");
            return token;
        });
        this.getFileInfo = (userID, fileID) => __awaiter(this, void 0, void 0, function* () {
            let currentFile = yield dbUtilsFile.getFileInfo(fileID, userID);
            if (!currentFile)
                throw new NotFoundError_1.default("Get File Info Not Found Error");
            const parentID = currentFile.metadata.parent;
            let parentName = "";
            if (parentID === "/") {
                parentName = "Home";
            }
            else {
                const parentFolder = yield folder_1.default.findOne({ "owner": userID, "_id": parentID });
                if (parentFolder) {
                    parentName = parentFolder.name;
                }
                else {
                    parentName = "Unknown";
                }
            }
            return Object.assign(Object.assign({}, currentFile), { parentName });
        });
        this.getQuickList = (user) => __awaiter(this, void 0, void 0, function* () {
            const userID = user._id;
            const s3Enabled = user.s3Enabled ? true : false;
            const quickList = yield dbUtilsFile.getQuickList(userID, s3Enabled);
            if (!quickList)
                throw new NotFoundError_1.default("Quick List Not Found Error");
            return quickList;
        });
        this.getList = (user, query) => __awaiter(this, void 0, void 0, function* () {
            const userID = user._id;
            let searchQuery = query.search || "";
            const parent = query.parent || "/";
            let limit = query.limit || 50;
            let sortBy = query.sortby || "DEFAULT";
            const startAt = query.startAt || undefined;
            const startAtDate = query.startAtDate || "0";
            const startAtName = query.startAtName || "";
            const storageType = query.storageType || undefined;
            const folderSearch = query.folder_search || undefined;
            sortBy = sortBySwitch_1.default(sortBy);
            limit = parseInt(limit);
            const s3Enabled = user.s3Enabled ? true : false;
            const queryObj = createQuery_1.default(userID, parent, query.sortby, startAt, startAtDate, searchQuery, s3Enabled, startAtName, storageType, folderSearch);
            const fileList = yield dbUtilsFile.getList(queryObj, sortBy, limit);
            if (!fileList)
                throw new NotFoundError_1.default("File List Not Found");
            return fileList;
        });
        this.getDownloadToken = (user) => __awaiter(this, void 0, void 0, function* () {
            const tempToken = yield user.generateTempAuthToken();
            if (!tempToken)
                throw new NotAuthorizedError_1.default("Get Download Token Not Authorized Error");
            return tempToken;
        });
        // No longer needed left for reference
        // getDownloadTokenVideo = async(user: UserInterface, cookie: string) => {
        //     if (!cookie) throw new NotAuthorizedError("Get Download Token Video Cookie Not Authorized Error");
        //     const tempToken = await user.generateTempAuthTokenVideo(cookie);
        //     if (!tempToken) throw new NotAuthorizedError("Get Download Token Video Not Authorized Error");
        //     return tempToken;
        // }
        this.removeTempToken = (user, tempToken, currentUUID) => __awaiter(this, void 0, void 0, function* () {
            const key = user.getEncryptionKey();
            const decoded = yield jsonwebtoken_1.default.verify(tempToken, env_1.default.passwordAccess);
            const publicKey = decoded.iv;
            const encryptedToken = user.encryptToken(tempToken, key, publicKey);
            const removedTokenUser = yield dbUtilsFile.removeTempToken(user, encryptedToken);
            if (!removedTokenUser)
                throw new NotFoundError_1.default("Remove Temp Token User Not Found Errors");
            delete tempStorage_1.default[currentUUID];
            yield removedTokenUser.save();
        });
        this.getSuggestedList = (userID, searchQuery) => __awaiter(this, void 0, void 0, function* () {
            searchQuery = new RegExp(searchQuery, 'i');
            const fileList = yield dbUtilsFile.getFileSearchList(userID, searchQuery);
            const folderList = yield dbUtilsFolder.getFolderSearchList(userID, searchQuery);
            if (!fileList || !folderList)
                throw new NotFoundError_1.default("Suggested List Not Found Error");
            return {
                fileList,
                folderList
            };
        });
        this.renameFile = (userID, fileID, title) => __awaiter(this, void 0, void 0, function* () {
            const file = yield dbUtilsFile.renameFile(fileID, userID, title);
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Rename File Not Found Error");
            return file;
        });
        this.moveFile = (userID, fileID, parentID) => __awaiter(this, void 0, void 0, function* () {
            let parentList = ["/"];
            if (parentID.length !== 1) {
                const parentFile = yield dbUtilsFolder.getFolderInfo(parentID, userID);
                if (!parentFile)
                    throw new NotFoundError_1.default("Rename Parent File Not Found Error");
                const parentList = parentFile.parentList;
                parentList.push(parentID);
            }
            const file = yield dbUtilsFile.moveFile(fileID, userID, parentID, parentList.toString());
            if (!file.lastErrorObject.updatedExisting)
                throw new NotFoundError_1.default("Rename File Not Found Error");
            return file;
        });
    }
}
exports.default = MongoFileService;
