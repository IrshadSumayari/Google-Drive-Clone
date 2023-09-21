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
const googleapis_1 = require("googleapis");
const googleAuth_1 = __importDefault(require("../../../db/googleAuth"));
const createQueryGoogle_1 = __importDefault(require("../../../utils/createQueryGoogle"));
const fields = 'id, name, size, modifiedTime, hasThumbnail, parents, mimeType, thumbnailLink, webViewLink, shared';
class GoogleDbUtil {
    constructor() {
        this.getList = (query, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const limit = query.limit;
            let parent = query.parent === "/" ? "root" : query.parent;
            const { queryBuilder, orderBy } = createQueryGoogle_1.default(query, parent);
            const previosPageToken = query.pageToken;
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const files = yield drive.files.list({ pageSize: limit, fields: `nextPageToken, files(${fields})`, q: queryBuilder, orderBy, pageToken: previosPageToken });
            return files;
        });
        this.getFileInfo = (id, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const file = yield drive.files.get({ fileId: id, fields: fields });
            return file;
        });
        this.getQuickList = (user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            let query = 'mimeType != "application/vnd.google-apps.folder" and trashed=false';
            const files = yield drive.files.list({ pageSize: 10, fields: `nextPageToken, files(${fields})`, q: query });
            return files;
        });
        this.getSuggestedList = (searchQuery, user) => __awaiter(this, void 0, void 0, function* () {
            const driveQuery = `name contains "${searchQuery}" and  mimeType != "application/vnd.google-apps.folder" and trashed=false`;
            const driveQueryFolder = `name contains "${searchQuery}" and mimeType = "application/vnd.google-apps.folder" and trashed=false`;
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const files = yield drive.files.list({ pageSize: 10, fields: `nextPageToken, files(${fields})`, q: driveQuery });
            const folders = yield drive.files.list({ pageSize: 10, fields: `nextPageToken, files(${fields})`, q: driveQueryFolder });
            return {
                files,
                folders
            };
        });
        this.renameFile = (fileID, title, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            yield drive.files.update({ fileId: fileID, requestBody: { name: title } });
        });
        this.removeFile = (fileID, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            yield drive.files.delete({ fileId: fileID });
        });
        this.getDownloadFileMetadata = (fileID, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const fileMetadata = yield drive.files.get({ fileId: fileID, fields: "*" });
            return { fileMetadata, drive };
        });
        this.moveFile = (fileID, parentID, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const previousFile = yield drive.files.get({
                fileId: fileID,
                fields: "*"
            });
            const previousParent = previousFile.data.parents[0];
            yield drive.files.update({
                fileId: fileID,
                addParents: parentID,
                removeParents: previousParent,
                fields: fields
            });
        });
        this.makeFilePublic = (fileID, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            yield drive.permissions.create({
                requestBody: {
                    type: "anyone",
                    role: "reader"
                },
                fileId: fileID,
                fields: "*"
            });
            const fileDetails = yield drive.files.get({
                fileId: fileID,
                fields: fields
            });
            const publicURL = fileDetails.data.webViewLink;
            return publicURL;
        });
        this.removePublicLink = (fileID, user) => __awaiter(this, void 0, void 0, function* () {
            const { fileMetadata, drive } = yield this.getDownloadFileMetadata(fileID, user);
            yield drive.permissions.get({
                fileId: fileID,
                permissionId: fileMetadata.data.permissionIds[0]
            });
            yield drive.permissions.delete({
                fileId: fileID,
                permissionId: fileMetadata.data.permissionIds[0]
            });
        });
    }
}
exports.default = GoogleDbUtil;
