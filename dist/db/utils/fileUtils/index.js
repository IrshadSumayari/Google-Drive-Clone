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
const mongoose_1 = __importDefault(require("../../mongoose"));
const mongodb_1 = require("mongodb");
const conn = mongoose_1.default.connection;
class DbUtil {
    constructor() {
        this.getPublicFile = (fileID) => __awaiter(this, void 0, void 0, function* () {
            let file = yield conn.db.collection("fs.files")
                .findOne({ "_id": new mongodb_1.ObjectID(fileID) });
            return file;
        });
        this.removeOneTimePublicLink = (fileID) => __awaiter(this, void 0, void 0, function* () {
            const file = yield conn.db.collection("fs.files")
                .findOneAndUpdate({ "_id": new mongodb_1.ObjectID(fileID) }, {
                "$unset": { "metadata.linkType": "", "metadata.link": "" }
            });
            return file;
        });
        this.removeLink = (fileID, userID) => __awaiter(this, void 0, void 0, function* () {
            const file = yield conn.db.collection("fs.files")
                .findOneAndUpdate({ "_id": new mongodb_1.ObjectID(fileID),
                "metadata.owner": new mongodb_1.ObjectID(userID) }, { "$unset": { "metadata.linkType": "", "metadata.link": "" } });
            return file;
        });
        this.makePublic = (fileID, userID, token) => __awaiter(this, void 0, void 0, function* () {
            const file = yield conn.db.collection("fs.files")
                .findOneAndUpdate({ "_id": new mongodb_1.ObjectID(fileID),
                "metadata.owner": new mongodb_1.ObjectID(userID) }, { "$set": { "metadata.linkType": "public", "metadata.link": token } });
            return file;
        });
        this.getPublicInfo = (fileID, tempToken) => __awaiter(this, void 0, void 0, function* () {
            const file = yield conn.db.collection("fs.files")
                .findOne({ "_id": new mongodb_1.ObjectID(fileID), "metadata.link": tempToken });
            return file;
        });
        this.makeOneTimePublic = (fileID, userID, token) => __awaiter(this, void 0, void 0, function* () {
            const file = yield conn.db.collection("fs.files")
                .findOneAndUpdate({ "_id": new mongodb_1.ObjectID(fileID),
                "metadata.owner": new mongodb_1.ObjectID(userID) }, { "$set": { "metadata.linkType": "one", "metadata.link": token } });
            return file;
        });
        this.getFileInfo = (fileID, userID) => __awaiter(this, void 0, void 0, function* () {
            const file = yield conn.db.collection("fs.files")
                .findOne({ "metadata.owner": new mongodb_1.ObjectID(userID), "_id": new mongodb_1.ObjectID(fileID) });
            return file;
        });
        this.getQuickList = (userID, s3Enabled) => __awaiter(this, void 0, void 0, function* () {
            let query = { "metadata.owner": new mongodb_1.ObjectID(userID) };
            if (!s3Enabled) {
                query = Object.assign(Object.assign({}, query), { "metadata.personalFile": null });
            }
            const fileList = yield conn.db.collection("fs.files")
                .find(query)
                .sort({ uploadDate: -1 })
                .limit(10)
                .toArray();
            return fileList;
        });
        this.getList = (queryObj, sortBy, limit) => __awaiter(this, void 0, void 0, function* () {
            const fileList = yield conn.db.collection("fs.files")
                .find(queryObj)
                .sort(sortBy)
                .limit(limit)
                .toArray();
            return fileList;
        });
        this.removeTempToken = (user, tempToken) => __awaiter(this, void 0, void 0, function* () {
            user.tempTokens = user.tempTokens.filter((filterToken) => {
                return filterToken.token !== tempToken;
            });
            return user;
        });
        this.getFileSearchList = (userID, searchQuery) => __awaiter(this, void 0, void 0, function* () {
            let query = { "metadata.owner": new mongodb_1.ObjectID(userID), "filename": searchQuery };
            const fileList = yield conn.db.collection("fs.files")
                .find(query)
                .limit(10)
                .toArray();
            return fileList;
        });
        this.renameFile = (fileID, userID, title) => __awaiter(this, void 0, void 0, function* () {
            const file = yield conn.db.collection("fs.files")
                .findOneAndUpdate({ "_id": new mongodb_1.ObjectID(fileID),
                "metadata.owner": new mongodb_1.ObjectID(userID) }, { "$set": { "filename": title } });
            return file;
        });
        this.moveFile = (fileID, userID, parent, parentList) => __awaiter(this, void 0, void 0, function* () {
            const file = yield conn.db.collection("fs.files")
                .findOneAndUpdate({ "_id": new mongodb_1.ObjectID(fileID),
                "metadata.owner": new mongodb_1.ObjectID(userID) }, { "$set": { "metadata.parent": parent, "metadata.parentList": parentList } });
            return file;
        });
        this.getFileListByParent = (userID, parentListString) => __awaiter(this, void 0, void 0, function* () {
            const fileList = yield conn.db.collection("fs.files")
                .find({ "metadata.owner": new mongodb_1.ObjectID(userID),
                "metadata.parentList": { $regex: `.*${parentListString}.*` } }).toArray();
            return fileList;
        });
        this.getFileListByOwner = (userID) => __awaiter(this, void 0, void 0, function* () {
            const fileList = yield conn.db.collection("fs.files")
                .find({ "metadata.owner": new mongodb_1.ObjectID(userID) }).toArray();
            return fileList;
        });
        this.removeChunksByID = (fileID) => __awaiter(this, void 0, void 0, function* () {
            yield conn.db.collection("fs.chunks").deleteMany({ files_id: fileID });
        });
    }
}
exports.default = DbUtil;
module.exports = DbUtil;
