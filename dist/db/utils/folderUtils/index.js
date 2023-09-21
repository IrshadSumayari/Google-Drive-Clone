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
const folder_1 = __importDefault(require("../../../models/folder"));
const mongodb_1 = require("mongodb");
class DbUtil {
    constructor() {
        this.getFolderSearchList = (userID, searchQuery) => __awaiter(this, void 0, void 0, function* () {
            let query = { "owner": userID, "name": searchQuery };
            const folderList = yield folder_1.default.find(query).limit(10);
            return folderList;
        });
        this.getFolderInfo = (folderID, userID) => __awaiter(this, void 0, void 0, function* () {
            const folder = yield folder_1.default.findOne({ "owner": userID, "_id": new mongodb_1.ObjectID(folderID) });
            return folder;
        });
        this.getFolderListByParent = (userID, parent, sortBy, s3Enabled, type, storageType, itemType) => __awaiter(this, void 0, void 0, function* () {
            let query = { "owner": userID, "parent": parent };
            if (!s3Enabled) {
                query = Object.assign(Object.assign({}, query), { "personalFolder": null });
            }
            if (type) {
                if (type === "mongo") {
                    query = Object.assign(Object.assign({}, query), { "personalFolder": null });
                }
                else if (type === "s3") {
                    query = Object.assign(Object.assign({}, query), { "personalFolder": true });
                }
            }
            if (itemType) {
                if (itemType === "personal")
                    query = Object.assign(Object.assign({}, query), { "personalFolder": true });
                if (itemType === "nonpersonal")
                    query = Object.assign(Object.assign({}, query), { "personalFolder": null });
            }
            const folderList = yield folder_1.default.find(query)
                .sort(sortBy);
            return folderList;
        });
        this.getFolderListBySearch = (userID, searchQuery, sortBy, type, parent, storageType, folderSearch, itemType, s3Enabled) => __awaiter(this, void 0, void 0, function* () {
            let query = { "name": searchQuery, "owner": userID };
            if (type) {
                if (type === "mongo") {
                    query = Object.assign(Object.assign({}, query), { "personalFolder": null });
                }
                else {
                    query = Object.assign(Object.assign({}, query), { "personalFolder": true });
                }
            }
            if (storageType === "s3") {
                query = Object.assign(Object.assign({}, query), { "personalFolder": true });
            }
            if (parent && (parent !== "/" || folderSearch)) {
                query = Object.assign(Object.assign({}, query), { parent });
            }
            if (!s3Enabled) {
                query = Object.assign(Object.assign({}, query), { "personalFolder": null });
            }
            if (itemType) {
                if (itemType === "personal")
                    query = Object.assign(Object.assign({}, query), { "personalFolder": true });
                if (itemType === "nonpersonal")
                    query = Object.assign(Object.assign({}, query), { "personalFolder": null });
            }
            const folderList = yield folder_1.default.find(query)
                .sort(sortBy);
            return folderList;
        });
        this.moveFolder = (folderID, userID, parent, parentList) => __awaiter(this, void 0, void 0, function* () {
            const folder = yield folder_1.default.findOneAndUpdate({ "_id": new mongodb_1.ObjectID(folderID),
                "owner": userID }, { "$set": { "parent": parent, "parentList": parentList } });
            return folder;
        });
        this.renameFolder = (folderID, userID, title) => __awaiter(this, void 0, void 0, function* () {
            const folder = yield folder_1.default.findOneAndUpdate({ "_id": new mongodb_1.ObjectID(folderID),
                "owner": userID }, { "$set": { "name": title } });
            return folder;
        });
        this.findAllFoldersByParent = (parentID, userID) => __awaiter(this, void 0, void 0, function* () {
            const folderList = yield folder_1.default.find({ "parentList": parentID, "owner": userID });
            return folderList;
        });
    }
}
exports.default = DbUtil;
