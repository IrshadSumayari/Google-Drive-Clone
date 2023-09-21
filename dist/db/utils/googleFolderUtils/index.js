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
const createQueryGoogleFolder_1 = __importDefault(require("../../../utils/createQueryGoogleFolder"));
const fields = 'id, name, createdTime, parents, mimeType';
class GoogleFolderUtils {
    constructor() {
        this.getList = (query, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const limit = query.limit;
            let parent = query.parent === "/" ? "root" : query.parent;
            const { orderBy, queryBuilder } = createQueryGoogleFolder_1.default(query, parent);
            const folders = yield drive.files.list({ pageSize: limit, fields: `files(${fields})`, q: queryBuilder, orderBy });
            return folders;
        });
        this.getInfo = (id, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const folder = yield drive.files.get({ fileId: id, fields: fields });
            return folder;
        });
        this.renameFolder = (folderID, title, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            yield drive.files.update({ fileId: folderID, requestBody: { name: title } });
        });
        this.removeFolder = (folderID, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            yield drive.files.delete({ fileId: folderID });
        });
        this.uploadFolder = (name, parent, user) => __awaiter(this, void 0, void 0, function* () {
            parent = parent === "/" ? "root" : parent;
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const folderMetadata = {
                name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parent]
            };
            const createdFolder = yield drive.files.create({
                requestBody: folderMetadata,
                fields: fields
            });
            return createdFolder;
        });
        this.moveFolder = (fileID, parentID, user) => __awaiter(this, void 0, void 0, function* () {
            const oauth2Client = yield googleAuth_1.default(user);
            const drive = googleapis_1.google.drive({ version: "v3", auth: oauth2Client });
            const previousFile = yield drive.files.get({
                fileId: fileID,
                fields: fields
            });
            const previousParent = previousFile.data.parents[0];
            yield drive.files.update({
                fileId: fileID,
                addParents: parentID,
                removeParents: previousParent,
                fields: fields
            });
        });
    }
}
exports.default = GoogleFolderUtils;
